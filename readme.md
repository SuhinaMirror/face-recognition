//Plan on how to use the MS Face API to recognize someone
//Pre-emptively
1) Create person group
2) Create a Person to the group
3) Get the personID from the new Person
4) Add a Face to the person x10 (with the id)
5) Train the group
//On new person walking nearby the mirror
6) Take a picture
7) FaceDetect the picture to get a faceId
8) Identify the faceId from the trained group
9) Get the user name from the group if found
