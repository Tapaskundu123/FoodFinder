const formBox = document.getElementById("formBox");
let signupMode = false; // Tracks sign-in (false) or sign-up (true)
let signupStep = 1; // Tracks signup step (1: initial signup, 2: vendor details)

function toggleForm() {
  signupMode = !signupMode;
  signupStep = 1;
  renderForm();
  const errorMessageDiv = document.getElementById('errorMessage');
  if (errorMessageDiv) {
    errorMessageDiv.innerHTML = '';
  }
}
function renderForm() {
  if (signupMode && signupStep === 1) {
    formBox.innerHTML = `
      <div id="errorMessage" class="text-red-500 mb-4"></div>
      <h3>Sign Up</h3>
     <input type="email" pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$">
      <input type="password" placeholder="Password" id="signupPassword" required />
      <select id="role">
        <option value="" disabled selected>Select Role</option>
        <option value="customer">Customer</option>
        <option value="vendor">Vendor</option>
      </select>
      <button onclick="handleInitialSubmit()">Next</button>
      <div class="toggle" onclick="toggleForm()">Already have an account? Sign In</div>
    `;
  } else if (signupMode && signupStep === 2) {
    formBox.innerHTML = `
      <div id="errorMessage" class="text-red-500 mb-4"></div>
      <h3>Vendor Details</h3>
      <input type="text" placeholder="Business Name" id="businessName" required />
      <button onclick="handleVendorSubmit()">Submit</button>
      <div class="toggle" onclick="toggleForm()">Already have an account? Sign In</div>
    `;
  } else {
    formBox.innerHTML = `
      <div id="errorMessage" class="text-red-500 mb-4"></div>
      <h3>Sign In</h3>
      <input type="email" placeholder="Email" id="loginEmail" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" />
      <input type="password" placeholder="Password" id="loginPassword" required />
      <button onclick="handleLogin()">Log In</button>
      <div class="toggle" onclick="toggleForm()">New user? Sign Up</div>
    `;
  }
}
function handleUserTypeChange(value) {
  const extra = document.getElementById("extraFields");
  if (value === "vendor") {
    extra.innerHTML = '';
    signupStep = 1; // Ensure we stay in step 1 until initial submit
  } else {
    extra.innerHTML = '';
  }
}
async function handleInitialSubmit() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('role').value;

  try {
    const response = await axios.post('api/auth/register', { email, password, role });
    // localStorage.setItem('token', response.data.token); // Assuming token is returned
    // localStorage.setItem('userName', response.data.user.name); // Adjust based on response
    // localStorage.setItem('role', role); // Store role
    if (role === 'vendor') {
      signupStep = 2;
      renderForm();
    } else {
      window.location.href = '/index.html';
    }
  } catch (err) {
    // Error handling remains unchanged
    const errorMessageDiv = document.getElementById('errorMessage');
    if (err.response && err.response.status === 409) {
      errorMessageDiv.innerHTML = `
        This email is already registered. Please use a different email or 
        <a href="#" onclick="toggleForm()" class="text-blue-500 underline">log in</a>.
      `;
    } else {
      let message = 'Signup failed. Please try again.';
      if (err.response) {
        message = `Signup failed: ${err.response.status} ${err.response.statusText}.`;
        if (err.response.data && err.response.data.message) {
          message += ` ${err.response.data.message}`;
        }
      } else {
        message = `Signup request failed. Is your server running? Error: ${err.message}`;
      }
      errorMessageDiv.textContent = message;
    }
    console.error(err);
  }
}
async function handleVendorSubmit() {
  const businessName = document.getElementById('businessName').value;

  try {
    // Assuming this updates the user profile rather than registering again
    const response = await axios.put('http://localhost:3000/api/auth/vendor', { businessName });
    // On success, redirect to dashboard
    window.location.href = '/index.html';
  } catch (err) {
    const errorMessageDiv = document.getElementById('errorMessage');
    if (err.response) {
      errorMessageDiv.textContent = `Failed to submit vendor details: ${err.response.status} ${err.response.statusText}.`;
      if (err.response.data && err.response.data.message) {
        errorMessageDiv.textContent += ` ${err.response.data.message}`;
      }
    } else {
      errorMessageDiv.textContent = `Submission failed. Is your server running? Error: ${err.message}`;
    }
    console.error(err);
  }
}
async function handleLogin() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });

    const data = res.data;
    // localStorage.setItem('token', data.token);
    // localStorage.setItem('userName', data.user.name);
    // localStorage.setItem('role', data.user.role); // Add this line
    alert('Login successful!');
    window.location.href = data.user.role === 'vendor' ? 'VendorDashboard.html' : 'index.html';
  } catch (err) {
    const message = err.response
      ? `Login failed: ${err.response.status} ${err.response.statusText}. Response: ${err.response.data?.message || 'No response body'}`
      : `Login request failed. Is your server running? Error: ${err.message}`;
    alert(message);
    console.error('Login error:', err);
  }
}

function loadFoodOptions(type) {
  const dropdown = document.getElementById("foodOptionsDropdown");
  let options = '';
  if (type === "veg") {
    options = `
      <select id="foodItem">
        <option disabled selected>Select Veg Food</option>
        <option>Pulao</option>
        <option>Paneer Roll</option>
        <option>Veg Thali</option>
        <option>Dosa</option>
        <option>Chhole Bhature</option>
      </select>
    `;
  } else if (type === "nonveg") {
    options = `
      <select id="foodItem">
        <option disabled selected>Select Non-Veg Food</option>
        <option>Chicken Biryani</option>
        <option>Egg Roll</option>
        <option>Chicken Curry</option>
        <option>Fish Fry</option>
        <option>Meat Thali</option>
      </select>
    `;
  }
  dropdown.innerHTML = options;
}

// Initialize form
renderForm();