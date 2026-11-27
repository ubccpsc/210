# REST Cookbook

This cookbook explores how a web service receives requests and responds to them. Writing a web service uses the same skills as the rest of the course, applied to programs that talk over a network. Handling a request is analogous to a function call: a record describing the request goes in, and a record describing the response comes out. You still check the input, report failures with a `Result`, and test the behaviour, exactly as you have been doing. What is new is the vocabulary (requests, responses, status codes, URLs) and a few widely used conventions about how REST is used.

The REST framework used in the labs and the project has its own reference, `FRAMEWORK.md`. This document covers what is true of any web service, independent of how its code is written.

## The Example Service

Our example is a small weather service. It knows about a few weather stations, and each station has readings for one day.

| Request | What it does |
|---|---|
| `GET /stations` | lists every station |
| `GET /stations/yvr/readings` | lists the readings of the station `yvr` |
| `GET /stations/yvr/readings?warmerThan=0` | lists only the readings warmer than 0 degrees |
| `POST /stations/yvr/readings` | records a new reading for the station `yvr` |

Each row in the table above is called an endpoint and represents one kind of request the service knows how to respond to.

## How a Web Service Works

A web service answers each request with a response, and each request is handled by a single function call. Which function is called depends on the request's method and URL.

### Requests and Responses

Requests have up to four parts:

| Part | Example | Says |
|---|---|---|
| method | `GET` | what kind of operation this is |
| path | `/stations/yvr/readings` | which thing the operation applies to |
| query string | `?warmerThan=0` | adjustments to the operation; optional |
| body | `{"hour":15,"tempCelsius":8}` | data being sent; only with some methods |

A response has two parts:

| Part | Example | Says |
|---|---|---|
| status code | `200` | how the request went |
| body | `[{"hour":12,"tempCelsius":3}]` | the answer, or a description of what went wrong |

Requests and responses travel as text. This is a request that records a reading, as it is sent over the network:

```text
POST /stations/yvr/readings HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"hour":15,"tempCelsius":8}
```

The first line holds the method and the path. A query string, when there is one, follows the path on that line. The lines after it are headers, which describe the message. `Content-Type: application/json` says the body is JSON so the receiver knows how to interpret it. A blank line ends the headers, and the body follows. A request with no body, such as a `GET`, ends after its headers.

This is the response:

```text
HTTP/1.1 201 Created
Content-Type: application/json

{"hour":15,"tempCelsius":8}
```

A response has the same layout, with the status code on its first line. A real response has several more headers than are shown here.

This format is dictated by the HTTP standard, which describes the protocol that all web browsers and web services use. A web service that uses HTTP and follows the conventions below for methods, paths, and status codes is called a REST service.

### The Server's Point of View

[Chapter 7](../../../part1/07_async#calling-web-services) called a web service with `fetch`. The web service is a program that starts, configures itself, and then waits for requests.

When a request arrives, the server finds the function responsible for it and calls that function once. The function is called a _handler_. A table of routes says which handler answers which request:

| Method | Path pattern | Handler |
|---|---|---|
| `GET` | `/stations` | lists the stations |
| `GET` | `/stations/:id/readings` | lists one station's readings |
| `POST` | `/stations/:id/readings` | records a reading |

A segment written `:id` matches any one segment of a path. The request `GET /stations/yvr/readings` matches the second row, with `id` standing for `yvr`. A request that does not match any row is answered with `404` and no handler is called.

There are two consequences of one request mapping to a single function call:

- Handlers are oblivious to prior requests. The only connection between two requests is in the state stored in the web service. Recording a reading with a `POST` changes the stored readings, and a later `GET` sees the change because it reads from the same object.
- Data held only in memory is lost when the server stops. A service that must persist its data across a restart has to write it somewhere (such as a file).

### Resources and URLs

A resource is a thing the service knows about. Each resource is named by a path.

| Path | Names |
|---|---|
| `/stations` | the collection of all stations |
| `/stations/yvr` | one station |
| `/stations/yvr/readings` | the collection of that station's readings |

A path is a noun. It says what the request is about, but not what to do with it. The method is the verb:

| Method | Means | Same effect if repeated? |
|---|---|---|
| `GET` | read the resource | yes; it changes nothing |
| `POST` | create something new | no; twice may create two |
| `PUT` | replace the resource | yes; the result is the same either way |
| `DELETE` | remove the resource | yes; once it is removed, it stays removed |

A service is easier to learn when it follows this division between the paths and the methods. `POST /stations/yvr/readings` adds to the collection of readings whereas `GET /stations/yvr/readings` returns the readings from the collection.

The query string parametrizes a request without naming a new resource. `?warmerThan=0` still asks for the readings of `yvr`, filtered. Query parameters are for filtering, sorting, and limiting. What identifies the resource should be included in the path.

### Everything Arrives as Text

A request is text, so every value in it reaches the handler as a string or as unchecked JSON:

| Where | Example | What the handler receives |
|---|---|---|
| a path segment | `/stations/yvr` | the string `"yvr"` |
| a query parameter | `?warmerThan=0` | the string `"0"` |
| a query parameter with no value | `?warmerThan=` | the empty string `""` |
| a query parameter that was not sent | | `undefined` |
| the body | `{"hour":15,"tempCelsius":8}` | whatever the JSON text held, of type `unknown` |

Anyone can send any request, so none of these values can be trusted to have the right form. A number in a path or query string has to be converted and checked, as [Converting Text to Numbers](../../../part1/07_async#converting-text-to-numbers) in Chapter 7 describes. A body has to be checked field by field before it is used, as [Checking Parsed Data](../../../part1/07_async#checking-parsed-data) describes. A missing query parameter and an empty one are different cases, and a handler usually has to decide what to do for each.

## Designing Responses

The response is the only thing a client gets back from the service. This section covers choosing a status code, writing an error body, and what a duplicate request should do.

### Choosing a Status Code

The status code tells a client how the request went before it reads the body. The first digit gives the kind of outcome:

| Range | Means | What the client should do |
|---|---|---|
| `2xx` | the request succeeded | use the body |
| `4xx` | the request was wrong | fix the request; sending it again unchanged fails the same way |
| `5xx` | the server failed | the request may have been fine; trying again later may work |

These are the codes the course uses most:

| Code | Name | Use when |
|---|---|---|
| `200` | OK | the request succeeded and the body holds the answer |
| `201` | Created | the request succeeded and created something new |
| `400` | Bad Request | the request is malformed: a missing field, a value of the wrong type, a number out of range |
| `404` | Not Found | the path names something that does not exist |
| `409` | Conflict | the request is well-formed, but the current state of the service refuses it |
| `500` | Internal Server Error | the server failed while handling a request that may have been fine |

To choose among the failures, ask these questions in order:

1. Does the path name something that exists? If not, the answer is `404`.
2. Could this request ever succeed as written? If it is malformed, no amount of waiting will fix it, and the answer is `400`.
3. Is the request well-formed, but refused because of what the service currently holds? Then the answer is `409`.
4. Did the server fail? Then the answer is `500`.

The example service shows the difference between the second and third. A reading whose hour is the string `"15"` is malformed:

```text
HTTP/1.1 400 Bad Request

{"error":"hour must be a whole number from 0 to 23"}
```

A well-formed reading for an hour the station already has a reading for is a conflict:

```text
HTTP/1.1 409 Conflict

{"error":"station 'yvr' already has a reading for hour 15"}
```

An empty answer is still an answer. A station with no readings answers `200` with an empty array, `[]`. The request named a real station and asked a reasonable question, and the answer is that there are none. A `200` with an error message in the body is not recommended because a client will check the status code first, and code that sees `200` will treat the body as a success case.

### Writing an Error Body

Every failure a service reports should have the same shape, so that a client can handle all of them with the same code. The services in this course use an object with one field:

```json
{ "error": "no station with id 'nowhere'" }
```

The message is meant to be read by a person, usually the developer of the web service client. A useful message names the value that was wrong, as this one names the id. [Chapter 19](../../../part3/03_api_design#web-service-surfaces) describes error bodies that a program can also act on.

### Repeating a Request

Networks fail, and a client that does not get an answer cannot tell which message was lost. The request may never have reached the service, or the service may have handled it and the response was lost on the way back. Clients will often choose to send the request again. The last column of the methods table says what that does.

A `GET` can be repeated freely, because it doesn't change any state. A `PUT` or a `DELETE` can be repeated because the second request leaves the service as the first one did (deleting an already-deleted resource still leaves that resource deleted). A `POST` is different. Sending the same `POST` twice asks for two things to be created, so the service has to decide what the second one means. The example service refuses a second reading for the same hour:

```text
POST /stations/yvr/readings   {"hour":15,"tempCelsius":8}     201 Created
POST /stations/yvr/readings   {"hour":15,"tempCelsius":8}     409 Conflict
```

When you design an endpoint that changes something, think about what a repeated request does and write it down in your documentation.

### Writing the Contract

A client's developer cannot read the web service's code. What they have is its documentation, which is the service's contract. For each endpoint, the contract states:

- the method and the path, with what each `:name` segment stands for;
- the query parameters and the body, with the type and allowed range of each value;
- the success response: its status code and the shape of its body; and
- every failure: its status code and when it occurs.

Write the contract before the code. The decisions above, such as `400` or `409`, are easier to make when they are written down side by side than when they are discovered one handler at a time. [Chapter 19](../../../part3/03_api_design#documenting-the-contract) covers documenting an API in more depth.

## Trying a Service by Hand

`curl` is a command-line program that sends one request and prints the response. It is a lightweight way to see what a running service does. Start the service in one terminal and use `curl` in another.

A URL on its own sends a `GET` and prints the body:

```text
$ curl http://localhost:3000/stations
[{"id":"yvr","name":"Vancouver Airport"},{"id":"yyj","name":"Victoria Airport"}]
```

`-i` also prints the status line and the headers, which is how to see a status code:

```text
$ curl -i http://localhost:3000/stations/nowhere/readings
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error":"no station with id 'nowhere'"}
```

A URL with a query string must be in quotes. The characters `?` and `&` mean something to the terminal, and without quotes the URL may not reach `curl` whole:

```text
$ curl "http://localhost:3000/stations/yvr/readings?warmerThan=0"
[{"hour":12,"tempCelsius":3}]
```

`-X` sets the method and `-d` supplies the body. The body goes in single quotes, because JSON uses double quotes:

```text
$ curl -i -X POST -H "Content-Type: application/json" -d '{"hour":15,"tempCelsius":8}' http://localhost:3000/stations/yvr/readings
HTTP/1.1 201 Created
Content-Type: application/json

{"hour":15,"tempCelsius":8}
```

| Option | Does |
|---|---|
| `-i` | prints the status line and headers before the body |
| `-X POST` | sends the request with the method `POST`; any method can be named |
| `-d '...'` | sends the text as the request's body |
| `-H "Content-Type: application/json"` | adds a header, here one saying the body is JSON |

A browser's address bar also sends a `GET`, so a `GET` endpoint can be tried by typing its URL there. A browser cannot send the other methods that way. If a browser does not access a specific endpoint and just requests `/`, the convention is for the service to return `index.html`, if it exists.

## Testing a Service

A handler is a function from a request to a response, so it can be tested without a network. The test builds the service, hands a request to the same code the server uses to find and call a handler, and checks the response it gets back. In the course's framework that code is `dispatch`, and the labs wrap it in a small test client:

```typescript
test("a station's readings are listed", async () => {
    const response: HttpResponse = await dispatch(routes, weather, "GET", "/stations/yvr/readings", undefined);

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal([
        { hour: 6, tempCelsius: -4 },
        { hour: 12, tempCelsius: 3 }
    ]);
});
```

No server is started and nothing is sent anywhere, so the test is fast and gives the same result every time. The body is passed and returned as a value, not as JSON text.

Four strategies make these tests useful:

- Build a new service for each test, in `beforeEach` as [Chapter 9](../../../part1/09_validation#shared-setup) describes, on a small amount of data for which you know all the correct answers.
- Check the status code and the body. A test that checks only the status passes when the body is wrong.
- Test each failure in the contract with its own test.
- Test a change by asking for it afterwards. A `POST` that answers `201` has not been shown to record anything until a `GET` returns the new reading:

```typescript
test("a recorded reading appears in the list", async () => {
    const created: HttpResponse = await dispatch(routes, weather, "POST", "/stations/yyj/readings", { hour: 9, tempCelsius: 5 });
    expect(created.status).to.equal(201);

    const listed: HttpResponse = await dispatch(routes, weather, "GET", "/stations/yyj/readings", undefined);
    expect(listed.body).to.deep.equal([{ hour: 9, tempCelsius: 5 }]);
});
```

The same reasoning applies after a failure. A request that was refused with `400` or `409` should leave the service as it was, and a following `GET` is how a test shows that.

## When a Request Fails

A request that does not do what you expected usually has one of a small number of causes. The response itself says which.

| What you see | Likely cause |
|---|---|
| `curl` reports that it could not connect | The server is not running, or it is listening on a different port. |
| `404` with a message such as `no route matches GET /station` | The method or the path has a typo, so no route matched and no handler ran. |
| `404` with your own message | The route matched and your handler ran. The thing the path names does not exist. |
| `400` saying the body is not valid JSON | The body's text is malformed. Check the quotes: JSON needs double quotes around every key and string. |
| `400` with your own message | Your handler refused the request. The message should say which value was wrong. |
| `500` | The handler threw an exception. The response body carries the exception's message. |
| `501` | In the labs, the handler is still the stub it shipped with. |
| The response is right, but a later request does not show the change | The handler answered without changing the stored data, or the server was restarted and the data was only in memory. |
