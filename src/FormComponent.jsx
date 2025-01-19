import React, { useState, useEffect, useCallback} from "react";
import emailValidator from "email-validator";
import {data} from "./data"


const FormComponent = () => {
  
const assignmentExists = useCallback((course, assignment) => {
    return data[course]?.includes(assignment) || false;},[]);

  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null)
  const [email,setEmail] =useState(null)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const courseParam = searchParams.get('course');
    const assignmentParam = searchParams.get('assignment');
    const emailParam = searchParams.get('email');
    if(assignmentExists(courseParam,assignmentParam)) {
      setCourse(courseParam);
      setAssignment(assignmentParam);
      setEmail(emailParam)
    }
  },[assignmentExists]);

  const [formData, setFormData] = useState({
    email: "",
  });

  const [apiResponse, setApiResponse] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEmail(formData.email)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email);
    if (!emailValidator.validate(email)) {
      setApiResponse("Invalid email address.");
      return;
    }

    try {
      setApiResponse(null);
      const response = await fetch(`/api/${course}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, course, assignment }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setApiResponse(data);
      console.log(apiResponse.results)
    } catch (error) {
      console.error("Error submitting form: ", error);
      setApiResponse("An error occurred during submission.");
    }
  };

  return (
    <div>
      {(assignmentExists(course,assignment)) ?
      <form onSubmit={handleSubmit}>
        <div>
          {!email &&
          <>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          </>
          }
        </div>
        <button type="submit">Grade Me!</button>
      </form> : (<div><h3>Welcome!</h3><p>This app is only meant to be used within the courses.</p><h3>Thank you!</h3></div>) }
      {apiResponse && (
        <div>
          <h3>Response:</h3>
          {apiResponse.message && <p>{apiResponse.message}</p>}
          {apiResponse.error && <p>Error: {apiResponse.error}</p>}
          {apiResponse.externalApiResponse && (
            <div>
              <h4>External API Response:</h4>
              <pre>
                {JSON.stringify(apiResponse.externalApiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )} 
    </div>
  );
};

export default FormComponent;
