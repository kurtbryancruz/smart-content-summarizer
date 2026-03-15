// ─────────────────────────────────────────────
// Smart Content Summarizer — Frontend (script.js)
// ─────────────────────────────────────────────

// Step 1: Grab all the HTML elements we'll need to interact with
// These correspond to the id= attributes in index.html

const textarea       = document.getElementById("article-input");   // The text input area
const summarizeBtn   = document.getElementById("summarize-btn");    // The "Summarize" button
const loadingDiv     = document.getElementById("loading");          // The loading spinner
const resultSection  = document.getElementById("result-section");   // The results box
const summaryList    = document.getElementById("summary-list");     // The <ul> for bullet points
const errorBox       = document.getElementById("error-box");        // The error message box
const errorMessage   = document.getElementById("error-message");    // Error text paragraph
const charCounter    = document.getElementById("char-counter");     // Character count display
const copyBtn        = document.getElementById("copy-btn");         // Copy to clipboard button


// ─────────────────────────────────────────────
// Character counter
// Updates as the user types in the textarea
// ─────────────────────────────────────────────

textarea.addEventListener("input", () => {
  charCounter.textContent = textarea.value.length;
});


// ─────────────────────────────────────────────
// Main function: handleSummarize
// Called when the user clicks the "Summarize" button
// ─────────────────────────────────────────────

async function handleSummarize() {
  // Step 1: Get the text from the textarea and remove extra spaces
  const articleText = textarea.value.trim();

  // Step 2: Don't proceed if the textarea is empty
  if (!articleText) {
    showError("Please paste an article before clicking Summarize.");
    return;
  }

  // Step 3: Don't proceed if the text is too short to summarize
  if (articleText.length < 100) {
    showError("Your text is too short. Please paste a longer article (at least 100 characters).");
    return;
  }

  // Step 4: Update the UI to show we're working
  setLoadingState(true);

  try {
    // Step 5: Send the text to our backend server using the Fetch API
    // The backend is running at /summarize (on the same server)
    const response = await fetch("/summarize", {
      method: "POST",                         // We're sending data, so POST
      headers: {
        "Content-Type": "application/json",   // Tell the server we're sending JSON
      },
      body: JSON.stringify({ text: articleText }), // Convert JS object to JSON string
    });

    // Step 6: Parse the JSON response from the server
    const data = await response.json();

    // Step 7: Check if the server returned an error
    if (!response.ok) {
      throw new Error(data.error || "An unexpected server error occurred.");
    }

    // Step 8: Display the summary bullet points
    displaySummary(data.summary);

  } catch (error) {
    // If anything went wrong (network error, server error, etc.), show the error
    showError(error.message || "Could not connect to the server. Is it running?");
  } finally {
    // Step 9: Always turn off the loading state when done
    // (whether it succeeded or failed)
    setLoadingState(false);
  }
}


// ─────────────────────────────────────────────
// Helper: setLoadingState(isLoading)
// Shows/hides the loading spinner and disables the button
// ─────────────────────────────────────────────

function setLoadingState(isLoading) {
  if (isLoading) {
    // Show the loading spinner
    loadingDiv.classList.remove("hidden");

    // Hide old results and errors
    resultSection.classList.add("hidden");
    errorBox.classList.add("hidden");

    // Disable the button so the user can't click it twice
    summarizeBtn.disabled = true;
    summarizeBtn.querySelector(".btn-text").textContent = "Summarizing…";
  } else {
    // Hide the loading spinner
    loadingDiv.classList.add("hidden");

    // Re-enable the button
    summarizeBtn.disabled = false;
    summarizeBtn.querySelector(".btn-text").textContent = "Summarize";
  }
}


// ─────────────────────────────────────────────
// Helper: displaySummary(summaryArray)
// Takes an array of 3 strings and renders them as bullet points
// ─────────────────────────────────────────────

function displaySummary(summaryArray) {
  // Step 1: Clear any previous bullet points
  summaryList.innerHTML = "";

  // Step 2: Loop through the 3 bullet points and create HTML for each
  summaryArray.forEach((point, index) => {
    // Create a list item element
    const li = document.createElement("li");

    // Build the inner HTML: a numbered circle + the text
    li.innerHTML = `
      <span class="bullet-num">${index + 1}</span>
      <span class="bullet-text">${escapeHtml(point)}</span>
    `;

    // Add the list item to the <ul>
    summaryList.appendChild(li);
  });

  // Step 3: Show the result section
  resultSection.classList.remove("hidden");

  // Step 4: Smoothly scroll down to the results
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


// ─────────────────────────────────────────────
// Helper: showError(message)
// Displays an error message to the user
// ─────────────────────────────────────────────

function showError(message) {
  errorMessage.textContent = message;
  errorBox.classList.remove("hidden");

  // Scroll the error into view
  errorBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


// ─────────────────────────────────────────────
// Helper: escapeHtml(text)
// Security measure: prevents XSS attacks by escaping HTML special characters
// This ensures user-supplied text is displayed as text, not executed as HTML
// ─────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}


// ─────────────────────────────────────────────
// Copy to Clipboard
// Copies all 3 bullet points when user clicks "Copy"
// ─────────────────────────────────────────────

copyBtn.addEventListener("click", () => {
  // Collect all bullet point texts
  const points = [...summaryList.querySelectorAll(".bullet-text")]
    .map((el, i) => `${i + 1}. ${el.textContent}`)
    .join("\n");

  // Use the browser's clipboard API
  navigator.clipboard.writeText(points).then(() => {
    // Briefly show "Copied!" feedback
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
  });
});


// ─────────────────────────────────────────────
// Event Listener: Summarize button click
// ─────────────────────────────────────────────

summarizeBtn.addEventListener("click", handleSummarize);


// ─────────────────────────────────────────────
// Bonus: Allow Ctrl+Enter to trigger summarize
// ─────────────────────────────────────────────

textarea.addEventListener("keydown", (event) => {
  // Check for Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    handleSummarize();
  }
});