# database

data types we need to store

### student

- id (number)
- created time
- preferred name
- email
- passcode
- (link to classes)
- (link to quizzes)
- (link to quiz attempts)

### instructors

- id (number)
- created time
- (auth token?)
- email?
- (link to classes)
- (link to quizzes)

### quiz

- id (number)
- created time
- name
- allotted time
- start date
- due date
- (link to questions)
- (link to creator - instructor)
- (link to students assigned)

### quiz attempt

- id (number)
- started time
- finished time
- `info on timed questions?`
- (link to student)
- answers selected

### question

- id (number)
- created time
- (allotted time, optional)
- text
- correct answer
- incorrect answers [(text, image)]

### answer

- id (number)
- text
- image

### class

- id (string)
- created time
- name
- (link to instructor) `allow multiple?`
- (link to students)
- (link to groups)

### groups

- id (string)
- created time
- name
- (link to class) `do we even need this to link back?`
- (link to students)