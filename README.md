# BPUT Result Fetch API

This API fetches student results, exam details, and other relevant information from the [Biju Patnaik University of Technology (BPUT) results website](https://results.bput.ac.in). It leverages Cloudflare Workers for fast and reliable API responses. The API provides endpoints for retrieving student details, results, exam information, and session lists.

## Features
- Retrieve student details by roll number.
- Fetch results for specific semesters and sessions.
- Return SGPA for a given semester.
- Get available exam sessions.
- Option to display results in both JSON and HTML formats.
- Easily extendable and customizable.

## Demo
A live demo of the API is hosted at:  
**[CheckOut Live Demo Here](https://bput-api.arctixapis.workers.dev/)**

You can use this as a demo to test the API functionality by providing the necessary parameters.

## Endpoints

### 1. **Home (`/`)**
   - **Description**: Serves a simple HTML homepage. The HTML file is fetched from a GitHub-hosted template.
   - **Method**: `GET`
   - **Response**: HTML page.

### 2. **Student Details (`/details`)**
   - **Description**: Fetches detailed information for a student based on their roll number.
   - **Method**: `GET`
   - **Parameters**:
     - `rollno` (required): The student's roll number.
   - **Response**: JSON object containing student details.
   - **Example Request**:
     ```bash
     GET https://<your-worker-url>/details?rollno=1234567890
     ```

### 3. **Student Results (`/results`)**
   - **Description**: Fetches a student's results for a specific semester.
   - **Method**: `GET`
   - **Parameters**:
     - `rollno` (required): The student's roll number.
     - `semid` (optional, default is `4`): Semester ID.
     - `session` (optional, default is `E24`): Session code (automatically mapped to its full name).
     - `html` (optional): Set to `true` to return results in HTML format.
   - **Response**: JSON object or HTML table containing the student's results.
   - **Example Request** (JSON):
     ```bash
     GET https://<your-worker-url>/results?rollno=1234567890&semid=4&session=E24
     ```
   - **Example Request** (HTML):
     ```bash
     GET https://<your-worker-url>/results?rollno=1234567890&semid=4&session=E24&html=true
     ```

### 4. **Exam Info (`/examinfo`)**
   - **Description**: Fetches exam-related information for a student.
   - **Method**: `GET`
   - **Parameters**:
     - `rollno` (required): The student's roll number.
     - `dob` (optional, default is `2009-07-14`): Date of birth of the student.
     - `session` (optional, default is `E24`): Session code.
   - **Response**: JSON object containing exam information.
   - **Example Request**:
     ```bash
     GET https://<your-worker-url>/examinfo?rollno=1234567890&dob=2001-01-01&session=E24
     ```

### 5. **SGPA (`/sgpa`)**
   - **Description**: Fetches the SGPA (Semester Grade Point Average) for a student.
   - **Method**: `GET`
   - **Parameters**:
     - `rollno` (required): The student's roll number.
     - `semid` (optional, default is `4`): Semester ID.
     - `session` (optional, default is `E24`): Session code.
   - **Response**: JSON object containing SGPA information.
   - **Example Request**:
     ```bash
     GET https://<your-worker-url>/sgpa?rollno=1234567890&semid=4&session=E24
     ```

### 6. **All Sessions (`/allsession`)**
   - **Description**: Returns all available exam sessions from the BPUT results website, along with their corresponding short codes.
   - **Method**: `GET`
   - **Response**: JSON array containing session names and short codes.
   - **Example Request**:
     ```bash
     GET https://<your-worker-url>/allsession
     ```

## Error Handling

- **400 Bad Request**: Returned when required parameters are missing (e.g., missing `rollno`).
- **500 Internal Server Error**: Returned when there is an issue fetching data from the BPUT website or GitHub-hosted HTML template.

## Session Mapping

Session codes are automatically mapped to their full names using a predefined session mapping. This ensures that users can pass short session codes (e.g., `E24`, `O23`) which are converted to their full equivalents (e.g., "Even-(2023-24)", "Odd-(2022-23)").

## HTML vs. JSON Output

For the `/results` endpoint, users can specify whether they want the output in JSON format (default) or HTML. To return HTML output, include the `html=true` query parameter. The HTML response includes a styled table of the student's results.

## Deployment

### Steps to Deploy on Cloudflare Workers:
1. **Create a new Worker** on Cloudflare.
2. **Copy the provided code** from this repository into the Worker script.
3. **Update** the `GITHUB_HTML_URL` in the script to point to your desired HTML template file (if required).
4. **Deploy** the Worker and test using the above endpoints.

### Optional Customization:
- You can customize the HTML template for the home page by modifying the file hosted at `GITHUB_HTML_URL`.
- The HTML template used in the `/results` endpoint is included inline in the code, and you can modify it as needed (e.g., to match the styling of your website).

## Example Use Case

A user can retrieve their exam results or SGPA by simply providing their roll number and the desired semester. Developers can integrate this API into a front-end dashboard or mobile app for students to quickly access their academic performance.

## Future Improvements
- **Authentication**: Implement user authentication for secure access to student results.
- **Caching**: Add response caching for improved performance, especially for frequently accessed endpoints.
- **UI Enhancements**: Further improvements to the HTML output and CSS styling for better user experience.

## Developer

This project was developed by **Sarbeswar Bhol**  
GitHub: [sarbeswarbhol](https://github.com/sarbeswarbhol)

## Contribution

- **ChatGPT** was used to generate some part of the code logic and documentation.
- Contributions and suggestions are always welcome!

## License
This project is licensed under the MIT License. You are free to use and modify it as per your needs.
