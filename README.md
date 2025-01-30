# 🎓✨ BPUT Result Fetch API 🚀

This API fetches student results, exam details, and other relevant information from the [Biju Patnaik University of Technology (BPUT) results website](https://results.bput.ac.in). It leverages ⚡ Cloudflare Workers for fast and reliable API responses. The API provides endpoints for retrieving student details, results, exam information, and session lists.

---

## 🌟 Key Features
✅ Retrieve student details by roll number 📜.  
✅ Fetch results for specific semesters and sessions 🎯.  
✅ Return SGPA for a given semester 📊.  
✅ Get available exam sessions 📆.  
✅ Option to display results in both JSON and HTML formats 🖥️.  
✅ Easily extendable and customizable 🔧.  

---

## 🌍 Live Demo 🎭
🚀 **[Check Out Live Demo Here](https://bput-api.arctixapis.workers.dev/)**  
Test the API functionality by providing the necessary parameters! 🎉

---

## 📌 API Endpoints

### 🏠 **Home (`/`)**
- **Description**: Serves a simple HTML homepage 🏡. The HTML file is fetched from a GitHub-hosted template.
- **Method**: `GET`
- **Response**: HTML page 📄.

---

### 🆔 **Student Details (`/details`)**
- **Description**: Fetches detailed information for a student based on their roll number 🎓.
- **Method**: `GET`
- **Parameters**:
  - 🏷️ `rollno` (required): The student's roll number.
- **Response**: JSON object containing student details 📜.
- **Example Request**:
  ```bash
  GET https://<your-worker-url>/details?rollno=1234567890
  ```

---

### 📚 **Student Results (`/results`)**
- **Description**: Fetches a student's results for a specific semester 🏆.
- **Method**: `GET`
- **Parameters**:
  - 🎓 `rollno` (required): The student's roll number.
  - 🏫 `semid` (optional, default is `4`): Semester ID.
  - 📅 `session` (optional, default is `E24`): Session code.
  - 🌐 `html` (optional): Set to `true` to return results in HTML format.
- **Response**: JSON or HTML table containing the student's results 📊.
- **Example Request**:
  ```bash
  GET https://<your-worker-url>/results?rollno=1234567890&semid=4&session=E24
  ```

---

### 📝 **Exam Info (`/examinfo`)**
- **Description**: Fetches exam-related information for a student 🏅.
- **Method**: `GET`
- **Parameters**:
  - 🎓 `rollno` (required): The student's roll number.
  - 📆 `dob` (optional, default is `2009-07-14`): Date of birth.
  - 📅 `session` (optional, default is `E24`): Session code.
- **Response**: JSON object containing exam details 🗂️.
- **Example Request**:
  ```bash
  GET https://<your-worker-url>/examinfo?rollno=1234567890&dob=2001-01-01&session=E24
  ```

---

### 🎯 **SGPA (`/sgpa`)**
- **Description**: Fetches the SGPA (Semester Grade Point Average) for a student 🏆.
- **Method**: `GET`
- **Parameters**:
  - 🎓 `rollno` (required): The student's roll number.
  - 🏫 `semid` (optional, default is `4`): Semester ID.
  - 📅 `session` (optional, default is `E24`): Session code.
- **Response**: JSON object containing SGPA 📊.
- **Example Request**:
  ```bash
  GET https://<your-worker-url>/sgpa?rollno=1234567890&semid=4&session=E24
  ```

---

### 📆 **All Sessions (`/allsession`)**
- **Description**: Returns all available exam sessions from the BPUT results website 📑.
- **Method**: `GET`
- **Response**: JSON array containing session names and short codes 🔄.
- **Example Request**:
  ```bash
  GET https://<your-worker-url>/allsession
  ```

---

## 🚨 Error Handling
⚠️ **400 Bad Request**: Missing required parameters ❌.  
⚠️ **500 Internal Server Error**: Issues fetching data from the BPUT website 🛑.  

---

## 🔄 Session Mapping
Session codes are automatically mapped to their full names 📜. Example:
- `E24` ➝ "Even-(2023-24)" 📆
- `O23` ➝ "Odd-(2022-23)" 🔄

---

## 🎭 HTML vs. JSON Output
For `/results`, use `html=true` for HTML output 🎨. Default is JSON 📂.

---

## 🚀 Deployment Guide
### Steps to Deploy on Cloudflare Workers 🌍:
1️⃣ **Create a Worker** on Cloudflare 🏗️.  
2️⃣ **Copy the provided code** into the Worker script 📄.  
3️⃣ **Update** `GITHUB_HTML_URL` if needed 🔧.  
4️⃣ **Deploy & Test** the API using endpoints 🧪.

---

## 🔮 Future Enhancements ✨
🔐 **Authentication**: Secure access for students 🔑.  
⚡ **Caching**: Improve performance 🚀.  
🎨 **UI Enhancements**: Better HTML styling 🎭.  

---

## 👨‍💻 Developer Info 🛠️
👤 Developed by **Sarbeswar Bhol** 👨‍💻  
🔗 GitHub: [sarbeswarbhol](https://github.com/sarbeswarbhol)  

---

## 🤝 Contribution & Acknowledgements 💡
💡 **ChatGPT** assisted in generating parts of this documentation 🤖.  
🛠️ Contributions and suggestions are always welcome! 🚀

---

## 📜 License 📄
📢 This project is licensed under the **MIT License**. Feel free to use and modify! 🎉
