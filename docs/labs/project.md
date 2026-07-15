# 210 Project

Students will individually design and build a web application of their own choosing. The project runs across three phases. Phase 1 focuses on user-centred design and the TypeScript model that will drive the application. Phase 2 adds a REST backend that persists data and exposes the model over HTTP. Phase 3 adds a web frontend that consumes the backend.

## Goals

* Apply OO design principles (abstraction, cohesion, encapsulation, interfaces) in a self-directed project.
* Practice user-centred design by deriving and prioritising user stories before writing code.
* Build a working full-stack web application: TypeScript model, REST API, and browser-based frontend.
* Write automated tests for model and backend behaviour.

## Restrictions

* Must be your own code; no code from other students, prior terms, or course materials may be in the repository, though npm packages are permitted.
* The domain cannot be a TODO list.
* The domain cannot duplicate a lab, lecture example, or activity from the course.
* The model must include a non-trivial class that maintains a collection of an _arbitrary_ (not fixed) number of items.
* No calling external web-service APIs; the application must be self-contained.
* TypeScript is required throughout; plain JavaScript is not permitted in either the frontend or the backend.
* Phases must be completed in order; each phase builds on the last.

## Phases

### Phase 1: Design and Model

Goal: Decide what to build, document it, and implement and test the model.

Tasks:

* T1: Choose an application. It must be original, cannot be a TODO app, and must have a non-trivial model class that keeps track of an arbitrary number of items.
* T2: Write 1-2 paragraphs in `README.md` describing what the application does, who it is for, and why it is useful.
* T3: Interview a user for the app, and follow a user-centred design approach to craft a set of at least four user stories that capture what the app should do.
    * Must include role-goal-benefit statements.
    * Must have an explicit definition of done.
    * Should detail preconditions and postconditions.
    * Should detail how errors are detected or handled. 
    * Should be independent, but can have an implied ordering (e.g., the ability to log in might be required for deleting elements).
    * Must be fully captured in the `README.md`; each user story should be called `Story N: <TITLE>` and appear under its own `##` heading.
    * One user story must be about viewing a list of items and another must be about manipulating the list. None of the user stories can be about persistence.
* T4: Implement the model in TypeScript (just the elements, with the programmatic ability to add/remove them). Define interfaces for key abstractions, implement classes that satisfy them, and write tests covering the model elements needed for the four user stories.

Grading notes:
* Tests are required for all model classes.
* Commit history is taken into account; you need to be able to show your work.
* Graded orally: Demonstrate test coverage, and an understanding of how all four user stories are supported by the code written.

### Phase 2: REST Backend

Goal: Expose the model over REST and make data persist across sessions.

Tasks:

* T1: Write two additional user stories, one for saving state and one for loading/restoring it, and add them to `README.md`.
* T2: Implement and test a REST backend (using Express or the course-provided framework) with routes that support all user stories from Phases 1 and 2.
* T3: Persist data to disk as JSON so the application does not start from scratch on restart.
* T4: Write endpoing documentation (saved in `API.md`) describing each endpoint, its inputs, outputs, and any other information a developer would need to effectively use the endpoint.
* T5: Add two new user stories to `README.md` that explore new aspects of the project not captured in the original user stories or in the work done in this deliverable. At the end of this phase you have eight user stories, six of which are implemented.

Grading notes:
* The four P1 user stories and the two persistence stories are each worth 15% of the deliverable.
* If a user story is missing from P1, that story is graded as 0 for this deliverable, but it should be written now so it is not penalised again in P3.
* The last 10% is from the quality of the REST endpoint developer documentation.
* Graded orally: Demonstrate test coverage and REST endpoint documentation, and demonstrate an understanding of how the backend supports the six user stories, including exceptional behaviour handling.

### Phase 3: Web Frontend

Goal: Create a browser-based interface for the backend.

Tasks:

* T1: Implement and test any backend work required for the two new user stories from P2.
* T2: Implement a web frontend for the eight user stories.
* T3: Add a section to the end of `README.md` describing the final design of the system, and detailing at least two strenghts and two weaknesses (specifically about future evolvability) of this design. For each weakness, describe how it could be improved.
* T4: Create a demo video for your app (max 2 minutes 30 seconds):
    * 30 seconds intro.
    * 15 seconds demonstrating each of the eight user stories.
    * Must either be committed to the repo as a single file (max file size 100 MB if in the repo), or be on a single publicly accessible link (e.g., YouTube) that the TAs can access without an account.

Grading notes:
* Each user story is worth 10% of the deliverable grade; the final 20% is from the video.
* Graded orally: Demonstrate the eight user stories and error handling. Demonstrate an understanding of how the code is designed, how it works, and how it can be extended in the future.


# Prior Project

5 phases:

* 0: idea + user stories
* 1: model + user interaction
* 2: data persistence
* 3: gui
* 4: logging

Restrictions:
    * has to be your own code (no OSS code or other student code in repo, although can use libraries)
    * not something from past term
    * can't be a TODO app (this is the domain of the sample used throughout the spec)
    * must follow phases in order
    * no using external web services
    * no absolute paths
    * required directory structure (`ui`/`model`)
    * checkstyle must pass


## Phase 0 (User Stories)

4 tasks:

* T0: manually provision repo 
* T1: figure out what you want to build. it must:
    * be java desktop app
    * cannot be taken from the labs, lectures, or activities
    * cannot be a TODO app or a commonly-known game
    * have a 'non-trivial model class* that keeps track of 'an arbitrary number of items' (CANNOT be fixed)
    * have a CLI at end of P1
    * have persist / restore at end of P2
    * have a GUI at end of P3
* T2: 1-2 paragraphs in README.md in valid markdown capturing what the application will do, for who, and why it is useful
* T3: four user stories (with more to come each subsequent phase)
    * only role, goal, benefit statements
    * at least one about adding/removing items
    * at least one about viewing the list of items
    * at least two not about persistence (this is phase 2)
    * added to end of README.md

## Phase 1 (Model + CLI)

2 tasks:

* T1: create the model classes needed to support four user stories
    * no println's allowed
    * should have tests for all model classes

* T2: create a command-line UI to interact with the model
    * no tests required

* Grade is coverage based (with warnings about gaming coverage)
* all four user stories weighted equally
* commit history matters

## Phase 2 (Persistence)

Goal: make it so all of the data can be saved / loaded so the app doesn't need to start from scratch

6 tasks:

* T1: finish phase 1, if not done already (or this phase is a waste of time)
* T2: create two user stories: one around saving, one around loading / reloading state
* T3: run our save/load demo to see what JSON looks like
* T4: write/test loading code, with provided library
* T5: write/test saving code, with provided library
* T6: optional: add more user stories

## Phase 3 (GUI)

3 tasks:

* T1: finish phase 2
* T2: optional: add more user stories
* T3: GUI
    * java swing
    * must view elements
    * must add/remove elements
    * must have a spash screen

## Phase 4 (Logging + Final UML)

3 tasks: 

* T1: finish phase 3
* T2: extract `Event`/`EventLog` from provided application and integrate logging into app
* T3: create UML diagram for the final version of the code
