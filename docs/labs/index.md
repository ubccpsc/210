# Lab scratchpad

Goal: Solving real problems using software. These problems should expose students to a variety of datasets should require a variety of different programming approaches to solve effectively.


* Single CSV
    - lab 1; answer simple questions from data
        - require iteration, state
        - process well-formed inputs
        - produce well-formed outputs
    - constraints:
        - would need async (for reading, unless we let them use sync API)
        - would otherwise be doable right away
            - would be easier after arrays (using map/filter/find), but not necessary
        - almost makes sense as the first lab
    - sample problems:
        - tides?
            - note: delete year so data seems less stale
            - min/max
                - per month, per year
            - greatest difference (between two tides)
            - coordination with moon phase??
    
* Single JSON File
    - lab 2; answer richer queries on data
        - input and output types can be complex objects
    - constraints:
        - let project 1 happen first so this can come after arrays
    - sample problems:
        - courses + prereqs? 
            - don't like this dataset as it changes and is used in class
        - flights
        - web usage data
        - academic genealogy (both seem like they could get stale)
            - Erdos number
            - publication data
        - music data (probably gets stale)        

* Zipped HTML files
    - HTML is nice in that it is a natural tree
    - should come after async so they can use JSZip
    - web pages should be well structured.
        - plant data for bc?
        - some kind of indigenous structured data?
            - archeological society of bc?

* Web service
    - late in the course
    - interact with a CMS without building a CMS?
        - get, put, post, delete
    - online task tracker
        - tasks
            - title/description/deadline/status
            - nested tasks

* Some kind of a game?
    - 110 does soduku
    - NYT word game
        - use API to count rounds?
    - game playing tracker?
        - game
        - when
        - who
        - outcome
    - course tracker!
        - assignments
        - labs
        - syllabus
        - grade tracking
        - computes grades
        - simulator
    
* Timetable generator
    - given list of courses and time slots make schedules
    - allow prefs: 
        - minimize distance between classes
        - minimize gaps between classes
        - favour early classes
        - favour late classes
 
* Medium lab to fix a bug and add a new feature to an existing codebase

* Large lab with a larger project to refactor existing code to replace with library that already provides a (similar) API
