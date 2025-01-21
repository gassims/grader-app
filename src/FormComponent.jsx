import React, { useState, useEffect, useCallback } from "react";
import emailValidator from "email-validator";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Box,
  Alert,
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
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState("en");
  const [triaged, setTriaged] = useState(false);

  async function support() {
    setTriaged(true);
    try {
      const response = await fetch(`/api/triage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, course, language }),
      });
      if (!response.ok) {
        console.log("Issue creating support ticket");
        return;
      } else {
        console.log("Support ticket created!");
      }
    } catch (error) {
      console.log("Issue creating support ticket");
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const courseParam = searchParams.get("course");
    const assignmentParam = searchParams.get("assignment");
    const emailParam = searchParams.get("email");
    const languageParam = searchParams.get("lang");
    setLanguage(languageParam);
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
    setEmail(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      (!emailValidator.validate(email) && usingParams === false) ||
      (!emailValidator.validate(formData.email) && usingParams === true)
    ) {
      setInvalidEmail("Invalid email address.");
      return;
    } else {
      try {
        setApiResponse(null);
        setSubmitting(true);
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
          setSubmitting(false);
          console.log(errorData.errorMessage);
          return;
        } else {
          const data = await response.json();
          setSuccess(true);
          setSubmitting(false);
          setApiResponse(data);
        }
      } catch (error) {
        setSubmitting(false);
        console.error("Error submitting form: ", apiResponse);
      }
    }
  };

  return (
    <div>
      {assignmentExists(course, assignment) ? (
        <form onSubmit={handleSubmit}>
          <Box sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}>
            {usingParams && (
              <>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  margin="dense"
                  fullWidth
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </>
            )}
            {
              <Button loading={submitting} variant="contained" type="submit">
                {language === "fr" //update variable //update Params
                  ? "Vérifier mes exercices"
                  : language === "es"
                  ? "Verificar mis ejercicios"
                  : "Check my lab results!"}
              </Button>
            }
          </Box>
        </form>
      ) : (
        <div>
          <h3>Welcome!</h3>
          <p>This app is only meant to be used within the courses.</p>
          <h3>Thank you!</h3>
        </div>
      )}
      {apiResponse && apiResponse.error ? (
        <Alert variant="outlined" severity="error">
          {apiResponse.message}
        </Alert>
      ) : null}

      {!invalidEmail && apiResponse && success !== false ? (
        apiResponse.results.length >= 0 ? (
          <Box>
            {apiResponse.finalGrade === 1 ? (
              <Alert variant="outlined" severity="success" color="info">
                Congratulations on successfully completing all the tasks in Lab{" "}
                {assignment}! Excellent work!
              </Alert>
            ) : (
              <Alert variant="outlined" severity="error">
                It appears that there are a few tasks that require your
                attention. Please review the feedback provided next to each
                task. Once you've made the adjustments in the DHIS2 instance,
                press the “Check my lab results” button again to reassess your
                work.
              </Alert>
            )}
            {triaged ? null : support()}
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
                        <TableCell>
                          {result.grade === 1
                            ? "Pass"
                            : result.reason === "Passed"
                            ? "Pass"
                            : "Fail"}
                        </TableCell>
                        <TableCell>
                          {result.reason === "Passed"
                            ? result.resultName
                            : result.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <p>Loading results...</p> // Optional loading state
        )
      ) : null}
    </div>
  );
};

export default FormComponent;
