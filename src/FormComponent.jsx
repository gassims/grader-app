import React, { useState, useEffect, useCallback } from "react";
import emailValidator from "email-validator";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { data } from "./data";

const FormComponent = () => {
  const assignmentExists = useCallback((course, assignment) => {
    return data[course]?.includes(assignment) || false;
  }, []);

  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [email, setEmail] = useState(null);
  const [invalidEmail, setInvalidEmail] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [success, setSuccess] = useState(false);
  const [usingParams, setUsingParams] = useState();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const courseParam = searchParams.get("course");
    const assignmentParam = searchParams.get("assignment");
    const emailParam = searchParams.get("email");
    if (assignmentExists(courseParam, assignmentParam)) {
      setCourse(courseParam);
      setAssignment(assignmentParam);
      setEmail(emailParam);
    }
    if (!emailParam) {
      setUsingParams(true);
    } else {
      setUsingParams(false);
    }
  }, [assignmentExists]);

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setEmail(formData.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValidator.validate(email)) {
      setInvalidEmail("Invalid email address.");
      return;
    } else {
      try {
        setApiResponse(null);
        const response = await fetch(`/api/${course}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, course, assignment }),
        });
        if (!response.ok) {
          // Handle 500 errors here
          const errorData = await response.json();
          setApiResponse({
            error: true,
            message:
              errorData?.errorMessage || "An error occurred on the server.",
          });
          console.log(errorData.errorMessage);
          return;
        } else {
          const data = await response.json();
          setSuccess(true);
          setApiResponse(data);
        }
      } catch (error) {
        console.error("Error submitting form: ", apiResponse);
      }
    }
  };

  return (
    <div>
      {assignmentExists(course, assignment) ? (
        <form onSubmit={handleSubmit}>
          <div>
            {usingParams && (
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
            )}
          </div>
          <button type="submit">Grade Me!</button>
        </form>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <p>This app is only meant to be used within the courses.</p>
          <h3>Thank you!</h3>
        </div>
      )}
      {apiResponse && <p>{apiResponse.message}</p>}

      {!invalidEmail && apiResponse && success !== false ? (
        apiResponse.results.length >= 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assignment</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiResponse.results &&
                  apiResponse.results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.resultName}</TableCell>
                      <TableCell>{result.grade}</TableCell>
                      <TableCell>{result.reason}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>Loading results...</p> // Optional loading state
        )
      ) : null}
    </div>
  );
};

export default FormComponent;
