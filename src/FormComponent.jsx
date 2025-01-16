import React, { useState } from "react";
import emailValidator from "email-validator";

const FormComponent = () => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [apiResponse, setApiResponse] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData.email);
    const email = formData.email;
    if (!emailValidator.validate(email)) {
      setApiResponse("Invalid email address. (jsx)");
      return;
    }

    try {
      setApiResponse(null);
      const response = await fetch(
        process.env.REACT_APP_API_URL + "/api/form-submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error submitting form: ", error);
      setApiResponse("An error occurred during submission.");
    }
  };

  return (
    <div>
      <h2>Request Grade</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Request</button>
      </form>

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
