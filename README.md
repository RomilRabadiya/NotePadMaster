# NotePadMaster







NOTEPAD✍️

















Table of Contents

1️⃣ INTRODUCTION
   • Purpose ............................................. 3
   • Definition ................................. 3
   • References ......................................... 4

2️⃣ OVERALL DESCRIPTION
   • Product Feature ................................. 4
   • User Classes ....................................... 5
   • Operating Environment ............................. 5

3️⃣ REQUIREMENTS
Home Page Module .................................................. 9
Note Management Module .................................... 9
Sharing & Collaboration Module ............................10
Undo/Redo Module ................................................. 10
Search & Filter Module ........................................... 10
Font Customization Module .................................. 12


4️⃣ NONFUNCTIONAL REQUIREMENTS
   • Performance Requirements .......................... 15
   • Safety Requirements ............................... 15
   • Security Requirements ............................. 15
   • Software Quality Attributes ....................... 15

5️⃣SYSTEM ARCHITECTURE
   • High-Level Architecture ........................... 16
   • Database Design ................................... 16

6️⃣CONCLUSION ........................................... 17




















1. Introduction

1.1 Purpose
To save notes and share them using a code.


Enable Login / Signup with user accounts.


Allow users to join a room using a code and access the same note across multiple devices.


Support operations to save, remove, and update notes.


Provide Undo and Redo functionality for notes.


Allow users to adjust the font size of the note content.


Enable users to search notes by title as well as description.



1.2 Definitions
This project is a collaborative note-taking application designed to help users create, manage, and share notes seamlessly across devices. It allows users to register/login, save personal notes, and collaborate in real-time with others by joining shared rooms using a unique code.
The application includes features such as note creation, deletion, and updating, along with Undo/Redo capabilities, font customization, and advanced search based on note title or description. The goal is to provide a user-friendly platform for individuals, teams, and students to capture and organize information efficiently, whether working solo or in a group.



1.3 References
Reference Github Repo. ::https://github.com/Rahul02M/Notepad-web

2. Overall Description

2.1 Product Features
🔐 User Authentication
Login / Signup functionality with secure account management.


Access your notes anytime, from any device.


📤 Share Notes via Code
Generate a unique code to share notes with others.


Collaborate by joining rooms using a shared code.


🧑‍🤝‍🧑 Real-Time Collaboration
Work on the same note across multiple devices or users in real time.


Perfect for teams, study groups, or multi-device workflows.


📝 Full Note Management
Create, edit, delete, and save notes with ease.


Keep your workspace organized and clutter-free.


↩️ Undo & Redo Support
Made a mistake? No problem.


Undo and Redo any changes made to your notes effortlessly.


🔠 Font Size Customization
Adjust the font size to your preference for better readability.


Ideal for accessibility and presentation needs.


🔍 Advanced Search
Search notes by title and description.


Quickly find the information you need without scrolling.



2.2 User Classes and Characteristics

👤 1. Registered Users
Description:
 Users who have created an account through the Login/Signup functionality.
Characteristics:
Can create, edit, delete, and save notes.


Can share notes via code and collaborate in real-time.


Have access to undo/redo and font customization features.


Can search notes by title or description.


May access notes from multiple devices.



👥 2. Guest Users (Optional / If Applicable)
Description:
 Users accessing the application without signing up.
Characteristics:
May have limited access (e.g., view-only mode or temporary session).


Cannot save notes permanently or access shared rooms.


Cannot collaborate with others unless converted to registered users.






2.3 Operating Environment
Platform: Web-based, accessible via modern web browsers on desktops, laptops, tablets, and mobile devices.


Devices: Computers, laptops, smartphones, and tablets.


Operating Systems:


Windows: 2000, XP, Vista, 7, 8, 10
macOS
Linux
RAM: Minimum 128 MB or higher


Disk Space: Minimum 20 MB of free space


Supported Browsers:


Mozilla Firefox
Google Chrome (Version 27.01 and above)
Microsoft Edge
Other modern browsers (e.g., Safari, Opera) may also be supported.
Internet Connection: A stable, high-speed internet connection is required for optimal performance.



2.4 Design and Implementation Constraints

CO-1: Project Timeline
The project is expected to be completed within a time frame of approximately 3 months, including development, testing, and deployment phases.
CO-2: Front-End Development
The front end of the application will be developed using React,html, and JavaScript, ensuring a responsive and user-friendly interface across various devices.
CO-3: Back-End Development
The back-end of the application will be built using Node.js and Express.js, ensuring scalability and security. The database will be managed using MongoDB, providing robust data storage and retrieval capabilities.
CO-4: Language Support
The website will support two languages: English, providing accessibility to a broader range of users.


   
3. Requirements

🔐 3.1 – User Registration
Description: The system should allow new users to register using their email and password.
  Input: Name, Email, Password
  Output: User account is created, and the user is redirected to the dashboard.

🔓 3.2 – User Login
Description: Users should be able to log in to their account using valid credentials.
  Input: Email, Password
  Output: User is authenticated and redirected to the note dashboard.

🚪 3.3 – User Logout
Description: Users should be able to log out of their session securely.
  Input: Click on the Logout button
  Output: User session ends, and they are redirected to the login page.

🆕 3.4 – Create Note
Description: Users should be able to create a new note by entering a title and content.
  Input: Note title and note description/content
  Output: A new note is saved and displayed in the user's note list.

✏️ 3.5 – Edit/Update Note
Description: Users should be able to edit existing notes.
  Input: Modified title or content of the note
  Output: The selected note is updated with new content.

🗑️ 3.6 – Delete Note
Description: Users should be able to delete any note they no longer need.
  Input: Selection of the note and confirmation of deletion
  Output: The note is permanently removed from the user’s account.

💾 3.7 – Save Note
Description: Users should be able to manually or automatically save their notes.
  Input: Save button click or autosave trigger (e.g., typing pause)
  Output: The note is stored securely in the database.

↩️ 3.8 – Undo Action
Description: Users should be able to undo their last change to a note.
  Input: Pressing Ctrl+Z or clicking an Undo button
  Output: The last change is reverted.
↪️ 3.9 – Redo Action
Description: Users should be able to redo an action that was previously undone.
  Input: Pressing Ctrl+Y or clicking a Redo button
  Output: The undone change is reapplied.

🔍 3.10 – Search Note by Title
Description: Users should be able to find notes by typing keywords from the title.
  Input: Search query in the search bar
  Output: A list of matching notes based on title is displayed.

🔎 3.11 – Search Note by Description
Description: Users should be able to search notes based on their content.
  Input: Keywords entered in the search bar
  Output: A filtered list of notes with matching content is shown.

🔠 3.12 – Adjust Font Size
Description: Users should be able to customize the font size of their notes for better readability.
  Input: Selection of font size from a dropdown or slider
  Output: Note text appears in the chosen font size.

🔗 3.13 – Generate Share Code
Description: Users should be able to generate a unique code to share a note with others.
  Input: Click on “Share” or “Generate Code” button
  Output: A unique code is generated and shown to the user.

🧩 3.14 – Join Shared Room by Code
Description: Users should be able to join a collaborative note session using a code.
  Input: Enter a valid share code into the join field
  Output: The shared note is opened and ready for collaborative editing.
👥 3.15 – Real-Time Collaboration
Description: Users in a shared room should see changes made by others in real-time.
  Input: One user makes changes to a shared note
  Output: All other users in the room instantly see the updated content.



4. Non-Functional Requirements

4.1 Usability
The platform should be easy to use, even for farmers with little technical experience.
The design should be clear and straightforward, with simple navigation and support for local languages.
4.2 Performance
The system should work quickly, with actions like loading or submitting taking no more than 3 seconds.
It should handle up to 1000 users at the same time without slowing down.
4.3 Security
All personal and financial data must be encrypted and kept safe.
The platform should protect user privacy and follow laws like GDPR or similar regulations.
Extra security features, like two-factor login, should be available.
4.4 Availability
The system should work 24/7 with very little downtime.
Backup systems should prevent data loss and keep things running smoothly during issues.
4.5 Scalability
The platform should grow easily to handle more users or new features in the future.
It should use cloud technology to adjust resources automatically as demand increases




5. System Architecture

5.1 High-Level Architecture
Client-Side (Front-End):


A user-friendly web app using modern frameworks like React.
Supports features like uploading crop photos, accessing soil reports, and getting market and scheme info.
Server-Side (Back-End):


Manages user requests, authentication, and business logic.
Built with scalable technologies like Node.js or Python.
Exposes secure APIs for front-end communication.
Database:


Stores user data, crop details, soil health, transactions, and scheme info.
Cloud Infrastructure:


Hosted on platforms like AWS, Azure, or GCP for high availability and scalability.
Auto-scaling and load balancing for handling user traffic.
5.2 Database Design
Key tables include:
Users: Profiles and login data.
Crops: Seasonal info and rotation suggestions.
Soil Health: Test results and improvement tips.
Diseases: Symptoms and treatments.
Market Transactions: Buyer/seller records.
Schemes: Eligibility and document requirements.
Data is securely stored and encrypted where needed.



6. Conclusion


This project provides a powerful yet user-friendly collaborative note-taking platform that enables users to create, manage, and share notes efficiently. With core features such as user authentication, real-time collaboration, note sharing via code, undo/redo operations, font customization, and advanced search, the application caters to both individual users and teams working across multiple devices.
The system is designed with a focus on simplicity, performance, and productivity, allowing users to stay organized and connected. By integrating modern collaboration and usability features, this solution offers a practical tool for students, professionals, and remote teams to capture ideas, share knowledge, and work together in real-time.

