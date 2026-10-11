console.log("SmartMeet customization loaded.");


// =====================================================
// GLOBAL SPEECH-TO-TEXT VARIABLES
// =====================================================

let speechRecognition = null;
let isRecording = false;
let recordTimer = null;
let recordSeconds = 0;


// =====================================================
// CREATE NEW MEETING SECTION
// =====================================================

// =====================================================
// PHASE 4: NEW MEETING WORKSPACE ICONS
// Inline vector icons, single stroke weight, currentColor
// =====================================================

const NM_ICON = {
    paste:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="5" y="4.5" width="14" height="16.5" rx="2"></rect>' +
        '<path d="M9 4.5V3.9A1.4 1.4 0 0 1 10.4 2.5h3.2A1.4 1.4 0 0 1 15 3.9v.6"></path>' +
        '<path d="M8.5 10.5h7M8.5 14h7M8.5 17.5h4"></path>' +
        '</svg>',

    txt:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M14 2.5H7.5A1.5 1.5 0 0 0 6 4v16a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V6.5z"></path>' +
        '<path d="M14 2.5V6.5H18"></path>' +
        '<path d="M9 12h6M9 15.5h6"></path>' +
        '</svg>',

    docx:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M14 2.5H7.5A1.5 1.5 0 0 0 6 4v16a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V6.5z"></path>' +
        '<path d="M14 2.5V6.5H18"></path>' +
        '<rect x="8.5" y="11" width="7" height="6" rx="1"></rect>' +
        '<path d="M8.5 13.7h7"></path>' +
        '</svg>',

    speech:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="9" y="2.5" width="6" height="11" rx="3"></rect>' +
        '<path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"></path>' +
        '<path d="M12 18v3.5"></path>' +
        '</svg>',

    upload:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 15.5V4"></path>' +
        '<path d="m8 7.5 4-3.5 4 3.5"></path>' +
        '<path d="M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"></path>' +
        '</svg>',

    file:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M14 2.5H7.5A1.5 1.5 0 0 0 6 4v16a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20V6.5z"></path>' +
        '<path d="M14 2.5V6.5H18"></path>' +
        '</svg>',

    arrow:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4.5 12h15"></path>' +
        '<path d="m13.5 6 6 6-6 6"></path>' +
        '</svg>',

    stop:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="6" y="6" width="12" height="12" rx="2.5"></rect>' +
        '</svg>'
};



// =====================================================
// STATUS / PROCESSING PRESENTATION HELPERS
// =====================================================

function setMeetingStatus(message, tone) {

    const el =
        document.getElementById(
            "meetingStatus"
        );


    if (!el) {

        return;

    }


    const text =
        message || "";

    el.textContent =
        text;


    if (text && tone) {

        el.setAttribute("data-tone", tone);
        el.setAttribute("data-visible", "true");

    }

    else {

        el.removeAttribute("data-visible");
        el.removeAttribute("data-tone");

    }

}


function setMeetingProcessing(active) {

    const panel =
        document.getElementById(
            "nmProcessing"
        );


    if (panel) {

        panel.setAttribute(
            "data-visible",
            active ? "true" : "false"
        );

    }


    const button =
        document.getElementById(
            "processMeetingButton"
        );


    if (button) {

        button.disabled =
            !!active;

    }

}



// =====================================================
// CREATE NEW MEETING SECTION
// =====================================================

function createNewMeetingSection() {

    const existingSection =
        document.getElementById("new-meeting");

    if (existingSection) {
        return existingSection;
    }


    const section =
        document.createElement("section");

    section.id = "new-meeting";


    section.innerHTML = `

        <div class="nm-shell">

            <header class="nm-header">
                <span class="nm-eyebrow">New Meeting</span>
                <h2 class="nm-heading">Start a New Meeting</h2>
                <p class="nm-subtitle">
                    Provide your meeting transcript and let AI turn
                    the conversation into actionable intelligence.
                </p>
            </header>


            <div class="nm-body">

                <div class="nm-field">
                    <label
                        class="nm-label"
                        for="meetingTitleInput"
                    >
                        Meeting Title
                    </label>
                    <input
                        class="nm-input"
                        id="meetingTitleInput"
                        type="text"
                        placeholder="e.g. Q3 Product Development Review"
                        autocomplete="off"
                    >
                </div>


                <div class="nm-field">
                    <span
                        class="nm-label"
                        id="nmModesLabel"
                    >
                        How would you like to provide the meeting?
                    </span>

                    <div
                        class="nm-modes"
                        role="group"
                        aria-labelledby="nmModesLabel"
                    >

                        <button
                            type="button"
                            class="nm-mode"
                            id="pasteTranscriptButton"
                            data-nm-mode="paste"
                            aria-pressed="true"
                        >
                            <span class="nm-mode-icon">${NM_ICON.paste}</span>
                            <span class="nm-mode-text">
                                <span class="nm-mode-title">Paste Transcript</span>
                                <span class="nm-mode-desc">Paste raw text</span>
                            </span>
                        </button>


                        <button
                            type="button"
                            class="nm-mode"
                            id="uploadTxtButton"
                            data-nm-mode="txt"
                            aria-pressed="false"
                        >
                            <span class="nm-mode-icon">${NM_ICON.txt}</span>
                            <span class="nm-mode-text">
                                <span class="nm-mode-title">Upload TXT</span>
                                <span class="nm-mode-desc">Plain text file</span>
                            </span>
                        </button>


                        <button
                            type="button"
                            class="nm-mode"
                            id="uploadDocxButton"
                            data-nm-mode="docx"
                            aria-pressed="false"
                        >
                            <span class="nm-mode-icon">${NM_ICON.docx}</span>
                            <span class="nm-mode-text">
                                <span class="nm-mode-title">Upload DOCX</span>
                                <span class="nm-mode-desc">Word document</span>
                            </span>
                        </button>


                        <button
                            type="button"
                            class="nm-mode"
                            id="speechToTextButton"
                            data-nm-mode="speech"
                            aria-pressed="false"
                        >
                            <span class="nm-mode-icon">${NM_ICON.speech}</span>
                            <span class="nm-mode-text">
                                <span class="nm-mode-title">Speech-to-Text</span>
                                <span class="nm-mode-desc">Record in browser</span>
                            </span>
                        </button>

                    </div>
                </div>


                <div class="nm-panels">

                    <div class="nm-panel" id="nmPanelTxt" hidden>
                        <div
                            class="nm-dropzone"
                            id="nmTxtDropzone"
                        >
                            <div class="nm-dropzone-icon">${NM_ICON.upload}</div>
                            <div class="nm-dropzone-title">Upload TXT Transcript</div>
                            <div class="nm-dropzone-sub">
                                Drag &amp; drop your .txt file here
                            </div>
                            <button
                                type="button"
                                class="nm-btn"
                                id="nmTxtChooseButton"
                            >
                                ${NM_ICON.file}
                                <span id="nmTxtChooseLabel">Choose TXT File</span>
                            </button>
                        </div>

                        <div class="nm-file-chip" id="nmTxtChip">
                            <div class="nm-file-icon">${NM_ICON.file}</div>
                            <div class="nm-file-meta">
                                <span class="nm-file-name" id="nmTxtFileName"></span>
                                <span class="nm-file-size" id="nmTxtFileSize"></span>
                            </div>
                            <button
                                type="button"
                                class="nm-file-remove"
                                id="nmTxtRemoveButton"
                            >
                                Remove
                            </button>
                        </div>
                    </div>


                    <div class="nm-panel" id="nmPanelDocx" hidden>
                        <div
                            class="nm-dropzone"
                            id="nmDocxDropzone"
                        >
                            <div class="nm-dropzone-icon">${NM_ICON.upload}</div>
                            <div class="nm-dropzone-title">Upload DOCX Transcript</div>
                            <div class="nm-dropzone-sub">
                                Drag &amp; drop your .docx file here
                            </div>
                            <button
                                type="button"
                                class="nm-btn"
                                id="nmDocxChooseButton"
                            >
                                ${NM_ICON.file}
                                <span id="nmDocxChooseLabel">Choose DOCX File</span>
                            </button>
                        </div>

                        <div class="nm-file-chip" id="nmDocxChip">
                            <div class="nm-file-icon">${NM_ICON.file}</div>
                            <div class="nm-file-meta">
                                <span class="nm-file-name" id="nmDocxFileName"></span>
                                <span class="nm-file-size" id="nmDocxFileSize"></span>
                            </div>
                            <button
                                type="button"
                                class="nm-file-remove"
                                id="nmDocxRemoveButton"
                            >
                                Remove
                            </button>
                        </div>
                    </div>


                    <div class="nm-panel" id="nmPanelSpeech" hidden>
                        <div class="nm-recorder" id="nmRecorder" data-recording="false">
                            <div class="nm-mic">${NM_ICON.speech}</div>
                            <div class="nm-mic-label" id="nmMicLabel">
                                Ready to record
                            </div>
                            <button
                                type="button"
                                class="nm-btn-primary"
                                id="nmRecordToggle"
                                aria-pressed="false"
                            >
                                ${NM_ICON.speech}
                                <span id="nmRecordToggleLabel">Start Recording</span>
                            </button>
                            <div
                                class="nm-record-status"
                                id="nmRecordStatus"
                                data-recording="false"
                            ></div>
                        </div>
                    </div>

                </div>


                <div class="nm-transcript" id="nmTranscript">

                    <div class="nm-transcript-head">
                        <label
                            class="nm-label"
                            for="meetingTranscriptInput"
                        >
                            Transcript
                        </label>
                        <span class="nm-title-chip" id="nmTitleChip">
                            Untitled Meeting
                        </span>
                    </div>

                    <textarea
                        class="nm-textarea"
                        id="meetingTranscriptInput"
                        placeholder="Paste your meeting transcript here..."
                    ></textarea>

                    <div class="nm-counter" id="nmWordCount">
                        0 words &middot; 0 characters
                    </div>

                    <p class="nm-hint">
                        Paste the transcript of your meeting here. The system
                        will extract summaries, topics, action items, owners,
                        deadlines, decisions and sentiment.
                    </p>

                </div>


                <div class="nm-processing" id="nmProcessing" data-visible="false">
                    <div class="nm-processing-head">
                        <span class="nm-spinner"></span>
                        <span class="nm-processing-title">
                            Processing Meeting...
                        </span>
                    </div>
                    <ul class="nm-steps">
                        <li>Analyzing transcript</li>
                        <li>Extracting topics and entities</li>
                        <li>Identifying action items</li>
                        <li>Generating meeting insights</li>
                    </ul>
                </div>


                <div class="nm-status" id="meetingStatus"></div>


                <div class="nm-actions">
                    <button
                        type="button"
                        class="nm-cta"
                        id="processMeetingButton"
                    >
                        <span>Process Meeting</span>
                        ${NM_ICON.arrow}
                    </button>
                </div>

            </div>

        </div>


        <input
            type="file"
            id="meetingFileInput"
            accept=".txt,.docx"
            style="display:none;"
        >
    `;


    const anchor = document.getElementById("dashboard") || document.getElementById("hero");
    if (anchor) {
        anchor.after(section);
    } else {
        document.body.appendChild(section);
    }


    // =================================================
    // ELEMENTS
    // =================================================

    const pasteButton =
        document.getElementById(
            "pasteTranscriptButton"
        );


    const uploadTxtButton =
        document.getElementById(
            "uploadTxtButton"
        );


    const uploadDocxButton =
        document.getElementById(
            "uploadDocxButton"
        );


    const speechButton =
        document.getElementById(
            "speechToTextButton"
        );


    const fileInput =
        document.getElementById(
            "meetingFileInput"
        );


    const processButton =
        document.getElementById(
            "processMeetingButton"
        );


    const transcriptInput =
        document.getElementById(
            "meetingTranscriptInput"
        );


    const status =
        document.getElementById(
            "meetingStatus"
        );


    const titleInput =
        document.getElementById(
            "meetingTitleInput"
        );


    const titleChip =
        document.getElementById(
            "nmTitleChip"
        );


    const wordCount =
        document.getElementById(
            "nmWordCount"
        );


    const transcriptWrap =
        document.getElementById(
            "nmTranscript"
        );


    const panels = {
        txt: document.getElementById("nmPanelTxt"),
        docx: document.getElementById("nmPanelDocx"),
        speech: document.getElementById("nmPanelSpeech")
    };


    const modeButtons =
        Array.from(
            section.querySelectorAll(
                "[data-nm-mode]"
            )
        );


    let currentMode = "paste";


    // =================================================
    // TRANSCRIPT HELPERS
    // =================================================

    function updateWordCount() {

        if (!wordCount || !transcriptInput) {
            return;
        }


        const raw =
            transcriptInput.value;

        const trimmed =
            raw.trim();


        const words =
            trimmed
                ? trimmed.split(/\s+/).length
                : 0;


        wordCount.textContent =
            words
            + (words === 1 ? " word" : " words")
            + " \u00b7 "
            + raw.length
            + (raw.length === 1 ? " character" : " characters");

    }


    function syncTranscriptVisibility() {

        if (!transcriptWrap || !transcriptInput) {
            return;
        }


        const hasText =
            transcriptInput.value.trim().length > 0;


        if (currentMode === "paste" || hasText) {
            transcriptWrap.removeAttribute("hidden");
        } else {
            transcriptWrap.setAttribute("hidden", "");
        }

    }


    if (transcriptInput) {

        transcriptInput.addEventListener(
            "input",
            function () {

                updateWordCount();
                syncTranscriptVisibility();

            }
        );

        updateWordCount();

    }


    // =================================================
    // TITLE (FRONTEND ONLY)
    // =================================================

    if (titleInput) {

        titleInput.addEventListener(
            "input",
            function () {

                if (!titleChip) {
                    return;
                }


                titleChip.textContent =
                    titleInput.value.trim()
                    || "Untitled Meeting";

            }
        );

    }


    // =================================================
    // MODE SELECTION
    // =================================================

    function setActiveMode(mode) {

        currentMode = mode;


        modeButtons.forEach(
            function (button) {

                const isActive =
                    button.getAttribute("data-nm-mode") === mode;

                button.setAttribute(
                    "aria-pressed",
                    isActive ? "true" : "false"
                );

            }
        );


        Object.keys(panels).forEach(
            function (key) {

                const panel = panels[key];

                if (!panel) {
                    return;
                }


                if (key === mode) {
                    panel.removeAttribute("hidden");
                } else {
                    panel.setAttribute("hidden", "");
                }

            }
        );


        syncTranscriptVisibility();

    }


    // =================================================
    // SELECTED FILE DISPLAY
    // =================================================

    function formatFileSize(bytes) {

        if (
            typeof bytes !== "number" ||
            !isFinite(bytes) ||
            bytes < 0
        ) {
            return "";
        }


        if (bytes < 1024) {
            return bytes + " B";
        }


        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }


        return (
            (bytes / (1024 * 1024)).toFixed(1)
            + " MB"
        );

    }


    function showSelectedFile(mode, file) {

        const chip =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxChip"
                    : "nmTxtChip"
            );

        const nameEl =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxFileName"
                    : "nmTxtFileName"
            );

        const sizeEl =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxFileSize"
                    : "nmTxtFileSize"
            );

        const chooseLabel =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxChooseLabel"
                    : "nmTxtChooseLabel"
            );


        if (nameEl) {
            nameEl.textContent = file.name;
        }

        if (sizeEl) {
            sizeEl.textContent = formatFileSize(file.size);
        }

        if (chooseLabel) {
            chooseLabel.textContent =
                mode === "docx"
                    ? "Replace DOCX File"
                    : "Replace TXT File";
        }

        if (chip) {
            chip.setAttribute("data-visible", "true");
        }

    }


    function clearSelectedFile(mode) {

        const chip =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxChip"
                    : "nmTxtChip"
            );

        const nameEl =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxFileName"
                    : "nmTxtFileName"
            );

        const sizeEl =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxFileSize"
                    : "nmTxtFileSize"
            );

        const chooseLabel =
            document.getElementById(
                mode === "docx"
                    ? "nmDocxChooseLabel"
                    : "nmTxtChooseLabel"
            );


        if (chip) {
            chip.removeAttribute("data-visible");
        }

        if (nameEl) {
            nameEl.textContent = "";
        }

        if (sizeEl) {
            sizeEl.textContent = "";
        }

        if (chooseLabel) {
            chooseLabel.textContent =
                mode === "docx"
                    ? "Choose DOCX File"
                    : "Choose TXT File";
        }

    }


    function resetTranscript() {

        if (transcriptInput) {
            transcriptInput.value = "";
        }

        if (fileInput) {
            fileInput.value = "";
        }

        updateWordCount();
        syncTranscriptVisibility();

    }


    // =================================================
    // FILE SELECTED (TXT / DOCX PARSING)
    // Shared by the file input and the drop zones
    // =================================================

    async function handleSelectedFile(file) {

        if (!file) {
            return;
        }


        const fileName =
            file.name.toLowerCase();


        const mode =
            fileName.endsWith(".docx")
                ? "docx"
                : "txt";


        if (file.size === 0) {

            clearSelectedFile(mode);

            setMeetingStatus(
                "This file is empty. Please choose another file.",
                "error"
            );

            return;

        }


        setActiveMode(mode);
        showSelectedFile(mode, file);


        // =====================================
        // TXT
        // =====================================

        if (
            fileName.endsWith(".txt")
        ) {

            setMeetingStatus(
                "Reading TXT file...",
                "info"
            );


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    transcriptInput.value =
                        event.target.result;


                    setMeetingStatus(
                        "TXT file loaded successfully.",
                        "success"
                    );

                    updateWordCount();
                    syncTranscriptVisibility();

                };


            reader.onerror =
                function () {

                    clearSelectedFile(mode);

                    setMeetingStatus(
                        "Unable to read this TXT file. Please try another file.",
                        "error"
                    );

                };


            reader.readAsText(file);


            return;

        }


        // =====================================
        // DOCX
        // =====================================

        if (
            fileName.endsWith(".docx")
        ) {

            setMeetingStatus(
                "Reading DOCX file...",
                "info"
            );

            // Check Mammoth

            if (
                typeof mammoth ===
                "undefined"
            ) {

                clearSelectedFile(mode);

                setMeetingStatus(
                    "DOCX reader is not loaded. Check index.html.",
                    "error"
                );

                return;

            }


            try {

                const arrayBuffer =
                    await file.arrayBuffer();


                const result =
                    await mammoth.extractRawText({
                        arrayBuffer:
                            arrayBuffer
                    });


                const extractedText =
                    result.value.trim();


                if (!extractedText) {

                    clearSelectedFile(mode);

                    setMeetingStatus(
                        "No text was found in this DOCX file.",
                        "error"
                    );

                    return;

                }


                transcriptInput.value =
                    extractedText;


                setMeetingStatus(
                    "DOCX loaded successfully. Review the transcript and process the meeting.",
                    "success"
                );


                transcriptInput.focus();

                updateWordCount();
                syncTranscriptVisibility();

            }

            catch (error) {

                console.error(
                    "DOCX processing error:",
                    error
                );

                clearSelectedFile(mode);

                setMeetingStatus(
                    "Unable to read this DOCX file. Please try another file.",
                    "error"
                );

            }


            return;

        }


        // =====================================
        // UNSUPPORTED
        // =====================================

        clearSelectedFile(mode);

        setMeetingStatus(
            "Please select a TXT or DOCX file.",
            "error"
        );

    }


    if (fileInput) {

        fileInput.addEventListener(
            "change",
            function () {

                if (!fileInput.files.length) {
                    return;
                }


                handleSelectedFile(
                    fileInput.files[0]
                );

            }
        );

    }


    // =================================================
    // DROP ZONES
    // =================================================

    function openFilePicker(mode) {

        if (!fileInput) {
            return;
        }


        fileInput.accept =
            mode === "docx"
                ? ".docx"
                : ".txt";

        fileInput.click();

    }


    function wireDropzone(dropzoneId, chooseId, mode) {

        const dropzone =
            document.getElementById(dropzoneId);

        const chooseButton =
            document.getElementById(chooseId);


        if (chooseButton) {

            chooseButton.addEventListener(
                "click",
                function () {

                    openFilePicker(mode);

                }
            );

        }


        if (!dropzone) {
            return;
        }


        ["dragenter", "dragover"].forEach(
            function (type) {

                dropzone.addEventListener(
                    type,
                    function (event) {

                        event.preventDefault();
                        dropzone.setAttribute("data-drag", "true");

                    }
                );

            }
        );


        ["dragleave", "dragend"].forEach(
            function (type) {

                dropzone.addEventListener(
                    type,
                    function () {

                        dropzone.setAttribute("data-drag", "false");

                    }
                );

            }
        );


        dropzone.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();
                dropzone.setAttribute("data-drag", "false");


                const dropped =
                    event.dataTransfer &&
                    event.dataTransfer.files &&
                    event.dataTransfer.files[0];

                if (!dropped) {
                    return;
                }


                const droppedName =
                    dropped.name.toLowerCase();

                const expected =
                    mode === "docx"
                        ? ".docx"
                        : ".txt";


                if (!droppedName.endsWith(expected)) {

                    setMeetingStatus(
                        mode === "docx"
                            ? "Please drop a .docx file."
                            : "Please drop a .txt file.",
                        "error"
                    );

                    return;

                }


                handleSelectedFile(dropped);

            }
        );

    }


    wireDropzone(
        "nmTxtDropzone",
        "nmTxtChooseButton",
        "txt"
    );

    wireDropzone(
        "nmDocxDropzone",
        "nmDocxChooseButton",
        "docx"
    );


    const txtRemoveButton =
        document.getElementById(
            "nmTxtRemoveButton"
        );

    const docxRemoveButton =
        document.getElementById(
            "nmDocxRemoveButton"
        );


    if (txtRemoveButton) {

        txtRemoveButton.addEventListener(
            "click",
            function () {

                clearSelectedFile("txt");
                resetTranscript();

                setMeetingStatus(
                    "TXT file removed.",
                    "info"
                );

            }
        );

    }


    if (docxRemoveButton) {

        docxRemoveButton.addEventListener(
            "click",
            function () {

                clearSelectedFile("docx");
                resetTranscript();

                setMeetingStatus(
                    "DOCX file removed.",
                    "info"
                );

            }
        );

    }


    // =================================================
    // MODE BUTTONS
    // =================================================

    if (pasteButton) {

        pasteButton.addEventListener(
            "click",
            function () {

                setActiveMode("paste");

                if (transcriptInput) {
                    transcriptInput.focus();
                }

            }
        );

    }


    if (uploadTxtButton) {

        uploadTxtButton.addEventListener(
            "click",
            function () {

                setActiveMode("txt");

                openFilePicker("txt");

            }
        );

    }


    if (uploadDocxButton) {

        uploadDocxButton.addEventListener(
            "click",
            function () {

                setActiveMode("docx");

                openFilePicker("docx");

            }
        );

    }


    if (speechButton) {

        speechButton.addEventListener(
            "click",
            function () {

                setActiveMode("speech");

            }
        );

    }


    // =================================================
    // SPEECH TO TEXT
    // Existing SpeechRecognition logic, unchanged
    // =================================================

    const recordToggle =
        document.getElementById(
            "nmRecordToggle"
        );

    const recordToggleLabel =
        document.getElementById(
            "nmRecordToggleLabel"
        );

    const micLabel =
        document.getElementById(
            "nmMicLabel"
        );

    const recordStatus =
        document.getElementById(
            "nmRecordStatus"
        );

    const recorder =
        document.getElementById(
            "nmRecorder"
        );


    function setRecordingState(recording) {

        if (recorder) {
            recorder.setAttribute(
                "data-recording",
                recording ? "true" : "false"
            );
        }

        if (recordStatus) {
            recordStatus.setAttribute(
                "data-recording",
                recording ? "true" : "false"
            );
        }

        if (recordToggle) {
            recordToggle.setAttribute(
                "aria-pressed",
                recording ? "true" : "false"
            );

            recordToggle.classList.toggle(
                "nm-btn-danger",
                recording
            );

            recordToggle.classList.toggle(
                "nm-btn-primary",
                !recording
            );
        }

        if (recordToggleLabel) {
            recordToggleLabel.textContent =
                recording
                    ? "Stop Recording"
                    : "Start Recording";
        }

        if (micLabel) {
            micLabel.textContent =
                recording
                    ? "Recording in progress"
                    : "Ready to record";
        }

    }


    function stopRecordTimer() {

        if (recordTimer) {

            clearInterval(recordTimer);
            recordTimer = null;

        }

    }


    function startRecordTimer() {

        stopRecordTimer();

        recordSeconds = 0;

        if (recordStatus) {
            recordStatus.textContent = "Recording \u00b7 00:00";
        }

        recordTimer =
            setInterval(
                function () {

                    recordSeconds += 1;

                    const minutes =
                        Math.floor(recordSeconds / 60);

                    const seconds =
                        recordSeconds % 60;

                    if (recordStatus) {

                        recordStatus.textContent =
                            "Recording \u00b7 "
                            + (
                                minutes < 10
                                    ? "0" + minutes
                                    : minutes
                            )
                            + ":"
                            + (
                                seconds < 10
                                    ? "0" + seconds
                                    : seconds
                            );

                    }

                },
                1000
            );

    }


    function formatRecordTime() {

        const minutes =
            Math.floor(recordSeconds / 60);

        const seconds =
            recordSeconds % 60;

        return (
            (minutes < 10 ? "0" + minutes : minutes)
            + ":"
            + (seconds < 10 ? "0" + seconds : seconds)
        );

    }


    if (recordToggle) {

        recordToggle.addEventListener(
            "click",
            function () {


                // =====================================
                // CHECK SUPPORT
                // =====================================

                if (
                    !(
                        "webkitSpeechRecognition"
                        in window
                    ) &&
                    !(
                        "SpeechRecognition"
                        in window
                    )
                ) {

                    setMeetingStatus(
                        "Speech-to-Text is not available in this browser.",
                        "error"
                    );

                    return;

                }


                // =====================================
                // STOP RECORDING
                // =====================================

                if (isRecording) {

                    if (speechRecognition) {

                        speechRecognition.stop();

                    }

                    return;

                }


                // =====================================
                // CREATE RECOGNITION
                // =====================================

                const SpeechRecognition =
                    window.SpeechRecognition ||
                    window.webkitSpeechRecognition;


                speechRecognition =
                    new SpeechRecognition();


                speechRecognition.continuous =
                    true;


                speechRecognition.interimResults =
                    true;


                speechRecognition.lang =
                    "en-US";


                // =====================================
                // START
                // =====================================

                isRecording =
                    true;


                setRecordingState(true);
                setActiveMode("speech");

                setMeetingStatus(
                    "Listening... Speak now.",
                    "recording"
                );


                try {

                    speechRecognition.start();

                    startRecordTimer();

                }

                catch (error) {

                    console.error(
                        "Speech recognition start error:",
                        error
                    );

                }


                // =====================================
                // RESULT
                // =====================================

                speechRecognition.onresult =
                    function (event) {

                        let finalTranscript =
                            "";


                        for (
                            let i = 0;
                            i < event.results.length;
                            i++
                        ) {

                            const transcript =
                                event.results[i][0].transcript;


                            if (
                                event.results[i].isFinal
                            ) {

                                finalTranscript +=
                                    transcript + " ";

                            }

                        }


                        if (finalTranscript) {

                            transcriptInput.value +=
                                finalTranscript;

                            updateWordCount();
                            syncTranscriptVisibility();

                        }

                    };


                // =====================================
                // ERROR
                // =====================================

                speechRecognition.onerror =
                    function (event) {

                        console.error(
                            "Speech recognition error:",
                            event.error
                        );


                        isRecording =
                            false;

                        stopRecordTimer();
                        setRecordingState(false);


                        if (
                            event.error ===
                            "not-allowed"
                        ) {

                            setMeetingStatus(
                                "Microphone permission was denied.",
                                "error"
                            );

                        }

                        else {

                            setMeetingStatus(
                                "Speech recognition error: "
                                + event.error,
                                "error"
                            );

                        }

                    };


                // =====================================
                // END
                // =====================================

                speechRecognition.onend =
                    function () {

                        isRecording =
                            false;

                        stopRecordTimer();
                        setRecordingState(false);


                        if (recordStatus) {
                            recordStatus.textContent =
                                "Last recording \u00b7 "
                                + formatRecordTime();
                        }


                        if (
                            status.textContent ===
                            "Listening... Speak now."
                        ) {

                            setMeetingStatus(
                                "Recording stopped. Review the transcript.",
                                "info"
                            );

                        }

                    };

            }
        );

    }


    // =================================================
    // PROCESS BUTTON
    // =================================================

    if (processButton) {

        processButton.addEventListener(
            "click",
            function () {

                processMeeting();

            }
        );

    }


    setActiveMode("paste");

}



// =====================================================
// PROCESS MEETING
// =====================================================

async function processMeeting() {

    const transcriptInput =
        document.getElementById(
            "meetingTranscriptInput"
        );

    const titleInput =
        document.getElementById(
            "meetingTitleInput"
        );

    const fileInput =
        document.getElementById(
            "meetingFileInput"
        );


    const transcript =
        transcriptInput.value.trim();

    const meetingTitle =
        titleInput ? titleInput.value.trim() : "";


    // =================================================
    // VALIDATION
    // =================================================

    if (
        !transcript &&
        (
            !fileInput ||
            !fileInput.files ||
            !fileInput.files.length
        )
    ) {

        setMeetingStatus(
            "Please provide a meeting transcript before processing.",
            "error"
        );

        return;

    }


    // =================================================
    // SEND TRANSCRIPT TO FLASK
    // =================================================

    if (transcript) {

        setMeetingProcessing(true);

        setMeetingStatus(
            "Processing meeting...",
            "info"
        );


        try {

            const response =
                await fetch(
                    "http://127.0.0.1:5000/api/process-text",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            transcript:
                                transcript
                        })
                    }
                );


            const result =
                await response.json();


            console.log(
                "Flask response:",
                result
            );


            // =========================================
            // SUCCESS
            // =========================================

            if (
                response.ok &&
                result.status === "success"
            ) {

                setMeetingProcessing(false);

                setMeetingStatus(
                    "Meeting processed successfully.",
                    "success"
                );


                // Save meeting
                saveMeetingToHistory(
                    transcript,
                    result.analysis,
                    meetingTitle
                );


                // Display results
                displayMeetingResults(
                    result.analysis,
                    meetingTitle
                );


                // Refresh history
                renderMeetingHistory();

            }


            // =========================================
            // ERROR
            // =========================================

            else {

                setMeetingProcessing(false);

                setMeetingStatus(
                    result.message ||
                    "Unable to process the meeting right now. Please try again.",
                    "error"
                );

            }

        }


        // =============================================
        // CONNECTION ERROR
        // =============================================

        catch (error) {

            console.error(
                "Flask connection error:",
                error
            );


            setMeetingProcessing(false);

            setMeetingStatus(
                "Unable to process the meeting right now. Please try again.",
                "error"
            );

        }


        return;

    }


    setMeetingStatus(
        "Please provide a meeting transcript before processing.",
        "error"
    );

}



// =====================================================
// SAVE MEETING TO HISTORY
// =====================================================

function saveMeetingToHistory(
    transcript,
    analysis,
    title
) {

    const meeting = {

        id:
            Date.now(),

        title:
            title || "Untitled Meeting",

        date:
            new Date().toISOString(),

        transcript:
            transcript,

        analysis:
            analysis

    };


    let meetings = [];


    try {

        meetings =
            JSON.parse(
                localStorage.getItem(
                    "smartMeetingHistory"
                )
            ) || [];

    }

    catch (error) {

        console.error(
            "Could not read meeting history:",
            error
        );

        meetings = [];

    }


    // Newest meeting first

    meetings.unshift(
        meeting
    );


    localStorage.setItem(
        "smartMeetingHistory",
        JSON.stringify(meetings)
    );


    console.log(
        "Meeting saved to history:",
        meeting
    );

}



// =====================================================
// GET MEETING HISTORY
// =====================================================

function getMeetingHistory() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "smartMeetingHistory"
            )
        ) || [];

    }

    catch (error) {

        console.error(
            "Could not load meeting history:",
            error
        );


        return [];

    }

}



// =====================================================
// CREATE MEETING HISTORY SECTION
// =====================================================

function createMeetingHistorySection() {

    let historySection =
        document.getElementById(
            "meeting-history"
        );


    if (historySection) {

        return historySection;

    }


    historySection =
        document.createElement(
            "section"
        );


    historySection.id =
        "meeting-history";


    historySection.style.cssText = `
        width:100%;
        max-width:1000px;
        margin:120px auto;
        padding:60px 30px;
        box-sizing:border-box;
        scroll-margin-top:120px;
    `;


    historySection.innerHTML = `

        <div style="
            background:#f8fafc;
            border:1px solid #dde5ed;
            border-radius:24px;
            padding:40px;
        ">


            <div style="
                font-size:14px;
                font-weight:600;
                letter-spacing:1px;
                color:#3d495b;
                margin-bottom:8px;
            ">
                MEETING HISTORY
            </div>


            <h2 style="
                font-size:42px;
                margin:0 0 10px;
                color:#1c1c1c;
            ">
                Your processed meetings will appear here.
            </h2>


            <p style="
                color:#5f6b7a;
                font-size:17px;
                margin-bottom:35px;
            ">
                No meetings yet.
            </p>


            <div id="historyList"></div>

        </div>
    `;


    const meetingSection =
        document.getElementById(
            "new-meeting"
        );


    if (meetingSection) {

        meetingSection.after(
            historySection
        );

    }

    else {

        document.body.appendChild(
            historySection
        );

    }


    renderMeetingHistory();


    return historySection;

}



// =====================================================
// RENDER MEETING HISTORY
// =====================================================

function renderMeetingHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );


    if (!historyList) {

        return;

    }


    const meetings =
        getMeetingHistory();


    // =================================================
    // NO MEETINGS
    // =================================================

    if (!meetings.length) {

        historyList.innerHTML = `

            <div style="
                text-align:center;
                padding:60px 20px;
                background:white;
                border:1px solid #dde5ed;
                border-radius:16px;
            ">

                <div style="
                    font-size:40px;
                    margin-bottom:15px;
                ">
                    📋
                </div>


                <h3>
                    No meetings yet
                </h3>


                <p style="
                    color:#5f6b7a;
                ">
                    Process your first meeting and
                    it will appear here.
                </p>

            </div>

        `;


        return;

    }


    // =================================================
    // MEETING CARDS
    // =================================================

    historyList.innerHTML =
        meetings
            .map(
                function (meeting) {

                    const analysis =
                        meeting.analysis ||
                        {};


                    const participants =
                        analysis.participants ||
                        [];


                    const actionItems =
                        analysis.action_items ||
                        [];


                    const summary =
                        analysis.summary ||
                        "No summary available.";


                    const date =
                        formatMeetingDate(
                            meeting.date
                        );


                    return `

                        <div style="
                            background:white;
                            border:1px solid #dde5ed;
                            border-radius:16px;
                            padding:24px;
                            margin-bottom:16px;
                        ">


                            <div style="
                                display:flex;
                                justify-content:space-between;
                                align-items:flex-start;
                                gap:20px;
                                flex-wrap:wrap;
                            ">


                                <div>

                                    <div style="
                                        font-size:13px;
                                        color:#6b7280;
                                        margin-bottom:8px;
                                    ">
                                        ${date}
                                    </div>


                                    <h3 style="
                                        margin:0 0 10px;
                                        font-size:22px;
                                    ">
                                        Meeting
                                    </h3>

                                </div>


                                <button
                                    type="button"
                                    onclick="viewMeetingFromHistory('${meeting.id}')"
                                    style="
                                        border:none;
                                        background:#1c1c1c;
                                        color:white;
                                        padding:11px 18px;
                                        border-radius:10px;
                                        cursor:pointer;
                                        font-weight:600;
                                    "
                                >
                                    View Meeting
                                </button>

                            </div>


                            <p style="
                                color:#3d495b;
                                line-height:1.6;
                                margin:15px 0 20px;
                            ">
                                ${escapeHTML(
                                    truncateText(
                                        summary,
                                        220
                                    )
                                )}
                            </p>


                            <div style="
                                display:flex;
                                gap:10px;
                                flex-wrap:wrap;
                            ">


                                <span style="
                                    padding:7px 12px;
                                    border-radius:999px;
                                    background:#f1f5f9;
                                    font-size:13px;
                                ">
                                    👥
                                    ${participants.length}
                                    Participants
                                </span>


                                <span style="
                                    padding:7px 12px;
                                    border-radius:999px;
                                    background:#f1f5f9;
                                    font-size:13px;
                                ">
                                    ✓
                                    ${actionItems.length}
                                    Action Items
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}



// =====================================================
// FORMAT MEETING DATE
// =====================================================

function formatMeetingDate(
    date
) {

    const meetingDate =
        new Date(date);


    if (
        Number.isNaN(
            meetingDate.getTime()
        )
    ) {

        return "Unknown date";

    }


    return meetingDate.toLocaleString(
        undefined,
        {
            dateStyle:
                "medium",

            timeStyle:
                "short"
        }
    );

}



// =====================================================
// VIEW SAVED MEETING
// =====================================================

function viewMeetingFromHistory(
    meetingId
) {

    const meetings =
        getMeetingHistory();


    const meeting =
        meetings.find(
            function (item) {

                return String(item.id) ===
                    String(meetingId);

            }
        );


    if (!meeting) {

        alert(
            "Meeting could not be found."
        );

        return;

    }


    displayMeetingResults(
        meeting.analysis
    );


    const resultsSection =
        document.getElementById(
            "meetingResults"
        );


    if (resultsSection) {

        resultsSection.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });

    }

}



// =====================================================
// GO TO MEETING HISTORY
// =====================================================

function goToMeetingHistory() {

    let historySection =
        document.getElementById(
            "meeting-history"
        );


    if (!historySection) {

        historySection =
            createMeetingHistorySection();

    }


    renderMeetingHistory();


    historySection.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });

}



// =====================================================
// DISPLAY MEETING RESULTS
// =====================================================

function displayMeetingResults(
    analysis,
    meetingTitle
) {

    if (!analysis) {

        return;

    }


    let resultsSection =
        document.getElementById(
            "meetingResults"
        );


    if (!resultsSection) {

        resultsSection =
            document.createElement(
                "section"
            );


        resultsSection.id =
            "meetingResults";


        const meetingSection =
            document.getElementById(
                "new-meeting"
            );


        if (meetingSection) {

            meetingSection.after(
                resultsSection
            );

        }

        else {

            document.body.appendChild(
                resultsSection
            );

        }

    }


    // =================================================
    // DATA EXTRACTION
    // =================================================

    const participants =
        analysis.participants ||
        [];


    const topics =
        analysis.topics ||
        [];


    const keywords =
        analysis.keywords ||
        [];


    const actionItems =
        analysis.action_items ||
        [];


    const decisions =
        analysis.decisions ||
        [];


    const sentiment =
        analysis.sentiment ||
        {};


    const summary =
        analysis.summary ||
        "No summary generated.";


    const displayTitle =
        meetingTitle || "Untitled Meeting";


    // Format date if available
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    const timeStr = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
    });


    // =================================================
    // HELPER: Status badge class
    // =================================================

    function getStatusClass(status) {

        const s = String(status || "Pending").toLowerCase();

        if (s === "in progress" || s === "in-progress") {
            return "mr-status-inprogress";
        }

        if (s === "done" || s === "completed" || s === "complete") {
            return "mr-status-done";
        }

        if (s === "blocked") {
            return "mr-status-blocked";
        }

        return "mr-status-pending";

    }


    // =================================================
    // HELPER: Sentiment bar width
    // =================================================

    function getSentimentWidth(value) {

        const n = Number(value);

        if (Number.isNaN(n)) {
            return 0;
        }

        // sentiment scores from VADER are 0-1 for pos/neu/neg
        return Math.min(100, Math.max(0, Math.round(n * 100)));

    }


    // =================================================
    // BUILD HTML PARTS
    // =================================================

    // ---- Summary ----
    const summaryHTML = escapeHTML(summary);


    // ---- Participants ----
    const participantsHTML = participants.length
        ? participants
            .map(p => `<span class="mr-chip">${escapeHTML(p)}</span>`)
            .join("")
        : '<span class="mr-empty">No participants detected.</span>';


    // ---- Topics ----
    const topicsHTML = topics.length
        ? topics
            .map(t => `<span class="mr-chip mr-chip-primary">${escapeHTML(t)}</span>`)
            .join("")
        : '<span class="mr-empty">No topics detected.</span>';


    // ---- Keywords ----
    const keywordsHTML = keywords.length
        ? keywords
            .map(k => `<span class="mr-chip">${escapeHTML(k)}</span>`)
            .join("")
        : '<span class="mr-empty">No keywords detected.</span>';


    // ---- Decisions ----
    const decisionsHTML = decisions.length
        ? decisions
            .map(item => {
                const text = item.decision || "";
                return `
                    <li class="mr-decision-item">
                        <div class="mr-decision-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span class="mr-decision-text">${escapeHTML(text)}</span>
                    </li>
                `;
            })
            .join("")
        : '<li class="mr-decision-item mr-empty">No decisions detected.</li>';


    // ---- Action Items ----
    const actionItemsHTML = actionItems.length
        ? `
            <div style="overflow-x:auto;">
                <table class="mr-actions-table" role="table">
                    <thead>
                        <tr>
                            <th scope="col">Task</th>
                            <th scope="col">Owner</th>
                            <th scope="col">Deadline</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${actionItems
                            .map(item => {
                                const task = escapeHTML(item.task || "Task");
                                const owner = item.owner ? escapeHTML(item.owner) : '<span class="mr-missing">Not specified</span>';
                                const deadline = item.deadline ? escapeHTML(item.deadline) : '<span class="mr-missing">Not specified</span>';
                                const statusClass = getStatusClass(item.status);
                                const statusLabel = escapeHTML(item.status || "Pending");
                                return `
                                    <tr>
                                        <td class="mr-task">${task}</td>
                                        <td>${owner}</td>
                                        <td>${deadline}</td>
                                        <td><span class="mr-status-badge ${statusClass}">${statusLabel}</span></td>
                                    </tr>
                                `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
        `
        : '<p class="mr-empty">No action items detected.</p>';


    // ---- Sentiment ----
    const overallSentiment = escapeHTML(sentiment.overall_sentiment || "Neutral");
    const positiveWidth = getSentimentWidth(sentiment.positive);
    const neutralWidth = getSentimentWidth(sentiment.neutral);
    const negativeWidth = getSentimentWidth(sentiment.negative);

    const sentimentHTML = `
        <div class="mr-sentiment-grid">
            <div class="mr-sentiment-card mr-sentiment-overall">
                <span class="mr-sentiment-label">Overall</span>
                <div class="mr-sentiment-value">${overallSentiment}</div>
                <div class="mr-sentiment-bar">
                    <div class="mr-sentiment-fill overall" style="width:${getSentimentWidth(sentiment.compound_score * 0.5 + 0.5)}%"></div>
                </div>
            </div>
            <div class="mr-sentiment-card">
                <span class="mr-sentiment-label">Positive</span>
                <div class="mr-sentiment-value">${Math.round(positiveWidth)}%</div>
                <div class="mr-sentiment-bar">
                    <div class="mr-sentiment-fill positive" style="width:${positiveWidth}%"></div>
                </div>
            </div>
            <div class="mr-sentiment-card">
                <span class="mr-sentiment-label">Neutral</span>
                <div class="mr-sentiment-value">${Math.round(neutralWidth)}%</div>
                <div class="mr-sentiment-bar">
                    <div class="mr-sentiment-fill neutral" style="width:${neutralWidth}%"></div>
                </div>
            </div>
            <div class="mr-sentiment-card">
                <span class="mr-sentiment-label">Negative</span>
                <div class="mr-sentiment-value">${Math.round(negativeWidth)}%</div>
                <div class="mr-sentiment-bar">
                    <div class="mr-sentiment-fill negative" style="width:${negativeWidth}%"></div>
                </div>
            </div>
        </div>
    `;


    // =================================================
    // RENDER
    // =================================================

    resultsSection.innerHTML = `
        <div class="mr-shell">
            <header class="mr-header">
                <div class="mr-header-left">
                    <span class="mr-eyebrow">Meeting Results</span>
                    <h1 class="mr-heading">${escapeHTML(displayTitle)}</h1>
                    <div class="mr-meta">
                        <span>${dateStr}</span>
                        <span class="mr-meta-sep" aria-hidden="true">Â·</span>
                        <span>${timeStr}</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button type="button" class="mr-btn" id="mrViewHistoryBtn" aria-label="View meeting history">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>View History</span>
                    </button>
                    <button type="button" class="mr-btn" id="mrNewMeetingBtn" aria-label="Process another meeting">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Process Another</span>
                    </button>
                </div>
            </header>

            <div class="mr-body">
                <!-- AI Summary -->
                <section class="mr-section" aria-labelledby="summaryTitle">
                    <h2 class="mr-section-title" id="summaryTitle">AI Summary</h2>
                    <div class="mr-card">
                        <p class="mr-summary">${summaryHTML}</p>
                    </div>
                </section>

                <!-- Participants & Topics -->
                <section class="mr-section" aria-labelledby="participantsTopicsTitle">
                    <h2 class="mr-section-title" id="participantsTopicsTitle">Participants & Topics</h2>
                    <div class="mr-grid-2">
                        <div class="mr-card">
                            <div class="mr-chips" role="list" aria-label="Participants">
                                ${participantsHTML}
                            </div>
                        </div>
                        <div class="mr-card">
                            <div class="mr-chips" role="list" aria-label="Topics">
                                ${topicsHTML}
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Action Items -->
                <section class="mr-section" aria-labelledby="actionItemsTitle">
                    <h2 class="mr-section-title" id="actionItemsTitle">Action Items</h2>
                    <div class="mr-card">
                        ${actionItemsHTML}
                    </div>
                </section>

                <!-- Decisions -->
                <section class="mr-section" aria-labelledby="decisionsTitle">
                    <h2 class="mr-section-title" id="decisionsTitle">Decisions</h2>
                    <div class="mr-card">
                        <ul class="mr-decisions-list" role="list" aria-label="Decisions">
                            ${decisionsHTML}
                        </ul>
                    </div>
                </section>

                <!-- Keywords -->
                <section class="mr-section" aria-labelledby="keywordsTitle">
                    <h2 class="mr-section-title" id="keywordsTitle">Keywords</h2>
                    <div class="mr-card">
                        <div class="mr-keywords-wrap" role="list" aria-label="Keywords">
                            ${keywordsHTML}
                        </div>
                    </div>
                </section>

                <!-- Sentiment Analysis -->
                <section class="mr-section" aria-labelledby="sentimentTitle">
                    <h2 class="mr-section-title" id="sentimentTitle">Sentiment Analysis</h2>
                    <div class="mr-card">
                        ${sentimentHTML}
                    </div>
                </section>

                <!-- Actions -->
                <div class="mr-actions">
                    <button type="button" class="mr-cta mr-cta-secondary" id="mrNewMeetingBtn2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Process Another Meeting</span>
                    </button>
                    <button type="button" class="mr-cta" id="mrViewHistoryBtn2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>View History</span>
                    </button>
                </div>
            </div>
        </div>
    `;


    // =================================================
    // ACTION BUTTONS
    // =================================================

    const newMeetingBtn1 = document.getElementById("mrNewMeetingBtn");
    const newMeetingBtn2 = document.getElementById("mrNewMeetingBtn2");
    const viewHistoryBtn1 = document.getElementById("mrViewHistoryBtn");
    const viewHistoryBtn2 = document.getElementById("mrViewHistoryBtn2");

    function goToNewMeeting() {
        const link = document.querySelector('a[href="#new-meeting"]');
        if (link) link.click();
    }

    function goToMeetingHistory() {
        const link = document.querySelector('a[href="#meeting-history"]');
        if (link) link.click();
    }

    [newMeetingBtn1, newMeetingBtn2].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", goToNewMeeting);
        }
    });

    [viewHistoryBtn1, viewHistoryBtn2].forEach(btn => {
        if (btn) {
            btn.addEventListener("click", goToMeetingHistory);
        }
    });


    // =================================================
    // SCROLL
    // =================================================

    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}



// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}



// =====================================================
// FORMAT SENTIMENT SCORE
// =====================================================

function formatScore(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "0%";

    }


    return (
        Math.round(
            number * 100
        )
        + "%"
    );

}



// =====================================================
// TRUNCATE TEXT
// =====================================================

function truncateText(
    text,
    maxLength
) {

    text =
        String(
            text || ""
        );


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength
        )
        + "..."
    );

}



// =====================================================
// GO TO DASHBOARD
// =====================================================

function goToDashboard() {
    const dashboard = document.getElementById("dashboard");
    if (dashboard) {
        dashboard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// =====================================================
// GO TO NEW MEETING
// =====================================================

function goToNewMeeting() {

    const section =
        document.getElementById(
            "new-meeting"
        );


    if (section) {

        section.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });

    }

}

// Expose navigation functions globally
window.goToDashboard = goToDashboard;
window.goToNewMeeting = goToNewMeeting;
window.goToMeetingHistory = goToMeetingHistory;
window.goToAnalytics = goToAnalytics;



// =====================================================
// GO TO HISTORY
// =====================================================

function goToMeetingHistory() {

    let historySection =
        document.getElementById(
            "meeting-history"
        );


    if (!historySection) {

        historySection =
            createMeetingHistorySection();

    }


    renderMeetingHistory();


    historySection.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });

}


// =====================================================
// ANALYTICS
// =====================================================

function createAnalyticsSection() {

    let analyticsSection =
        document.getElementById(
            "analytics"
        );


    if (analyticsSection) {
        return analyticsSection;
    }


    analyticsSection =
        document.createElement("section");


    analyticsSection.id =
        "analytics";


    analyticsSection.style.cssText = `
        width:100%;
        max-width:1100px;
        margin:120px auto;
        padding:60px 30px;
        box-sizing:border-box;
        scroll-margin-top:120px;
    `;


    analyticsSection.innerHTML = `

        <div style="
            background:#f8fafc;
            border:1px solid #dde5ed;
            border-radius:24px;
            padding:40px;
        ">

            <div style="
                font-size:14px;
                font-weight:600;
                letter-spacing:1px;
                color:#3d495b;
                margin-bottom:8px;
            ">
                SMART MEETING GENERATOR
            </div>


            <h2 style="
                font-size:42px;
                margin:0 0 10px;
                color:#1c1c1c;
            ">
                Analytics
            </h2>


            <p style="
                color:#5f6b7a;
                font-size:17px;
                margin-bottom:35px;
            ">
                Overview of your processed meetings.
            </p>


            <div
                id="analyticsCards"
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(4, 1fr);
                    gap:16px;
                "
            ></div>
            <div style="
    display:grid;
    grid-template-columns:
        repeat(2, 1fr);
    gap:20px;
    margin-top:25px;
">


    <!-- TOPICS -->

    <div style="
        background:white;
        border:1px solid #dde5ed;
        border-radius:16px;
        padding:25px;
    ">

        <h3 style="
            margin-top:0;
            margin-bottom:20px;
        ">
            Most Discussed Topics
        </h3>


        <div id="analyticsTopics"></div>

    </div>
<div style="
    background:white;
    border:1px solid #dde5ed;
    border-radius:16px;
    padding:25px;
    margin-top:20px;
">

    <h3 style="
        margin-top:0;
        margin-bottom:20px;
    ">
        Meetings Over Time
    </h3>

    <div style="
        position:relative;
        height:350px;
    ">
        <canvas id="meetingsOverTimeChart"></canvas>
    </div>

</div>


    <!-- SENTIMENT -->

    <div style="
        background:white;
        border:1px solid #dde5ed;
        border-radius:16px;
        padding:25px;
    ">

        <h3 style="
            margin-top:0;
            margin-bottom:20px;
        ">
            Overall Sentiment
        </h3>


        <div id="analyticsSentiment"></div>

    </div>

</div>

        </div>
    `;


    const historySection =
        document.getElementById(
            "meeting-history"
        );


    if (historySection) {

        historySection.after(
            analyticsSection
        );

    }

    else {

        document.body.appendChild(
            analyticsSection
        );

    }


    renderAnalytics();
renderMeetingsOverTimeChart();

    return analyticsSection;

}



// =====================================================
// RENDER ANALYTICS
// =====================================================

function renderAnalytics() {

    const cards =
        document.getElementById(
            "analyticsCards"
        );


    if (!cards) {
        return;
    }


    const meetings =
        getMeetingHistory();


    let totalActionItems =
        0;

    let totalDecisions =
        0;

    let totalParticipants =
        0;


    meetings.forEach(
        function (meeting) {

            const analysis =
                meeting.analysis || {};


            const actionItems =
                Array.isArray(
                    analysis.action_items
                )
                    ? analysis.action_items
                    : [];


            const decisions =
                Array.isArray(
                    analysis.decisions
                )
                    ? analysis.decisions
                    : [];


            const participants =
                Array.isArray(
                    analysis.participants
                )
                    ? analysis.participants
                    : [];


            totalActionItems +=
                actionItems.length;


            totalDecisions +=
                decisions.length;


            totalParticipants +=
                participants.length;

        }
    );


    cards.innerHTML = `

        <div style="
            background:white;
            border:1px solid #dde5ed;
            border-radius:16px;
            padding:25px;
        ">

            <div style="
                font-size:30px;
                margin-bottom:12px;
            ">
                
            </div>


            <div style="
                color:#6b7280;
                font-size:14px;
                margin-bottom:8px;
            ">
                Total Meetings
            </div>


            <div style="
                font-size:36px;
                font-weight:700;
                color:#1c1c1c;
            ">
                ${meetings.length}
            </div>

        </div>


        <div style="
            background:white;
            border:1px solid #dde5ed;
            border-radius:16px;
            padding:25px;
        ">

            <div style="
                font-size:30px;
                margin-bottom:12px;
            ">
                
            </div>


            <div style="
                color:#6b7280;
                font-size:14px;
                margin-bottom:8px;
            ">
                Total Action Items
            </div>


            <div style="
                font-size:36px;
                font-weight:700;
                color:#1c1c1c;
            ">
                ${totalActionItems}
            </div>

        </div>


        <div style="
            background:white;
            border:1px solid #dde5ed;
            border-radius:16px;
            padding:25px;
        ">

            <div style="
                font-size:30px;
                margin-bottom:12px;
            ">
                
            </div>


            <div style="
                color:#6b7280;
                font-size:14px;
                margin-bottom:8px;
            ">
                Total Decisions
            </div>


            <div style="
                font-size:36px;
                font-weight:700;
                color:#1c1c1c;
            ">
                ${totalDecisions}
            </div>

        </div>


        <div style="
            background:white;
            border:1px solid #dde5ed;
            border-radius:16px;
            padding:25px;
        ">

            <div style="
                font-size:30px;
                margin-bottom:12px;
            ">
                👥
            </div>


            <div style="
                color:#6b7280;
                font-size:14px;
                margin-bottom:8px;
            ">
                Total Participants
            </div>


            <div style="
                font-size:36px;
                font-weight:700;
                color:#1c1c1c;
            ">
                ${totalParticipants}
            </div>

        </div>

    `;
    renderAnalyticsDetails();

}




// =====================================================
// GO TO ANALYTICS
// =====================================================

function goToAnalytics() {

    let analyticsSection =
        document.getElementById(
            "analytics"
        );


    if (!analyticsSection) {

        analyticsSection =
            createAnalyticsSection();

    }


    renderAnalytics();


    analyticsSection.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}

// =====================================================
// TOPICS ANALYTICS
// =====================================================

function getTopicAnalytics() {

    const meetings =
        getMeetingHistory();

    const topicCounts = {};


    meetings.forEach(
        function (meeting) {

            const analysis =
                meeting.analysis || {};

            const topics =
                Array.isArray(
                    analysis.topics
                )
                    ? analysis.topics
                    : [];


            topics.forEach(
                function (topic) {

                    const cleanTopic =
                        String(topic)
                            .trim()
                            .toLowerCase();


                    if (!cleanTopic) {
                        return;
                    }


                    topicCounts[cleanTopic] =
                        (
                            topicCounts[cleanTopic]
                            || 0
                        ) + 1;

                }
            );

        }
    );


    return Object.entries(
        topicCounts
    )
    .sort(
        function (a, b) {

            return b[1] - a[1];

        }
    )
    .slice(0, 5);

}



// =====================================================
// SENTIMENT ANALYTICS
// =====================================================

function getSentimentAnalytics() {

    const meetings =
        getMeetingHistory();


    let positive = 0;
    let neutral = 0;
    let negative = 0;


    meetings.forEach(
        function (meeting) {

            const analysis =
                meeting.analysis || {};

            const sentiment =
                analysis.sentiment || {};


            positive +=
                Number(
                    sentiment.positive
                ) || 0;


            neutral +=
                Number(
                    sentiment.neutral
                ) || 0;


            negative +=
                Number(
                    sentiment.negative
                ) || 0;

        }
    );


    const total =
        positive +
        neutral +
        negative;


    if (total === 0) {

        return {
            positive: 0,
            neutral: 0,
            negative: 0
        };

    }


    return {

        positive:
            Math.round(
                (positive / total) * 100
            ),

        neutral:
            Math.round(
                (neutral / total) * 100
            ),

        negative:
            Math.round(
                (negative / total) * 100
            )

    };

}



// =====================================================
// UPDATE ANALYTICS DETAILS
// =====================================================

function renderAnalyticsDetails() {

    const analyticsSection =
        document.getElementById(
            "analytics"
        );


    if (!analyticsSection) {
        return;
    }


    // =================================================
    // TOPICS
    // =================================================

    const topicContainer =
        document.getElementById(
            "analyticsTopics"
        );


    if (topicContainer) {

        const topics =
            getTopicAnalytics();


        if (!topics.length) {

            topicContainer.innerHTML = `

                <p style="
                    color:#6b7280;
                ">
                    No topic data available yet.
                </p>

            `;

        }

        else {

            const highestCount =
                topics[0][1];


            topicContainer.innerHTML =
                topics.map(
                    function (item) {

                        const topic =
                            item[0];

                        const count =
                            item[1];


                        const percentage =
                            Math.max(
                                15,
                                Math.round(
                                    (
                                        count /
                                        highestCount
                                    ) * 100
                                )
                            );


                        return `

                            <div style="
                                margin-bottom:18px;
                            ">

                                <div style="
                                    display:flex;
                                    justify-content:space-between;
                                    margin-bottom:7px;
                                    font-size:14px;
                                ">

                                    <span style="
                                        text-transform:capitalize;
                                    ">
                                        ${escapeHTML(topic)}
                                    </span>


                                    <strong>
                                        ${count}
                                    </strong>

                                </div>


                                <div style="
                                    width:100%;
                                    height:9px;
                                    background:#e9eef3;
                                    border-radius:999px;
                                    overflow:hidden;
                                ">

                                    <div style="
                                        width:${percentage}%;
                                        height:100%;
                                        background:#1c1c1c;
                                        border-radius:999px;
                                    "></div>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

        }

    }



    // =================================================
    // SENTIMENT
    // =================================================

    const sentimentContainer =
        document.getElementById(
            "analyticsSentiment"
        );


    if (sentimentContainer) {

        const sentiment =
            getSentimentAnalytics();


        sentimentContainer.innerHTML = `

            <div style="
                margin-bottom:20px;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:7px;
                ">

                    <span>
                        Positive
                    </span>

                    <strong>
                        ${sentiment.positive}%
                    </strong>

                </div>


                <div style="
                    width:100%;
                    height:10px;
                    background:#e9eef3;
                    border-radius:999px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${sentiment.positive}%;
                        height:100%;
                        background:#1c1c1c;
                        border-radius:999px;
                    "></div>

                </div>

            </div>


            <div style="
                margin-bottom:20px;
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:7px;
                ">

                    <span>
                        Neutral
                    </span>

                    <strong>
                        ${sentiment.neutral}%
                    </strong>

                </div>


                <div style="
                    width:100%;
                    height:10px;
                    background:#e9eef3;
                    border-radius:999px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${sentiment.neutral}%;
                        height:100%;
                        background:#64748b;
                        border-radius:999px;
                    "></div>

                </div>

            </div>


            <div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:7px;
                ">

                    <span>
                        Negative
                    </span>

                    <strong>
                        ${sentiment.negative}%
                    </strong>

                </div>


                <div style="
                    width:100%;
                    height:10px;
                    background:#e9eef3;
                    border-radius:999px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${sentiment.negative}%;
                        height:100%;
                        background:#334155;
                        border-radius:999px;
                    "></div>

                </div>

            </div>

        `;

    }

}


// =====================================================
// MEETINGS OVER TIME CHART
// =====================================================

function renderMeetingsOverTimeChart() {

    const canvas =
        document.getElementById(
            "meetingsOverTimeChart"
        );

    if (!canvas) {
        return;
    }


    const meetings =
        getMeetingHistory();


    const dateCounts = {};


    meetings.forEach(
        function (meeting) {

            // Try the possible date fields
            const rawDate =
                meeting.date ||
                meeting.createdAt ||
                meeting.timestamp ||
                meeting.time ||
                meeting.created ||
                null;


            if (!rawDate) {
                return;
            }


            const date =
                new Date(rawDate);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return;
            }


            const dateKey =
                date.toLocaleDateString(
                    undefined,
                    {
                        month: "short",
                        day: "numeric"
                    }
                );


            dateCounts[dateKey] =
                (
                    dateCounts[dateKey] ||
                    0
                ) + 1;

        }
    );


    const labels =
        Object.keys(
            dateCounts
        );


    const values =
        Object.values(
            dateCounts
        );


    // Remove previous chart
    if (
        window.meetingsOverTimeChart instanceof Chart
    ) {

        window.meetingsOverTimeChart.destroy();

    }


    // No valid dates
    if (labels.length === 0) {

        const container =
            canvas.parentElement;


        container.innerHTML = `

            <div style="
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#6b7280;
                text-align:center;
            ">

                No meeting date data available yet.

            </div>

        `;

        return;

    }


    window.meetingsOverTimeChart =
        new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Meetings",

                            data: values,

                            tension: 0.3,

                            fill: false,

                            borderWidth: 2,

                            pointRadius: 5

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            display: true

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0

                            }

                        }

                    }

                }

            }
        );

}
// =====================================================
// PAGE CUSTOMIZATION
// =====================================================

function initSmartMeet() {

        console.log(
            "Applying SmartMeet changes..."
        );


        // =================================================
        // PAGE TITLE
        // =================================================

        document.title =
            "Smart Meeting Notes Generator";



        // =================================================
        // HERO
        // =================================================

        const hero =
            document.querySelector(
                "#hero"
            );


        if (hero) {


            // =============================================
            // HERO HEADING
            // =============================================

            const heroHeading =
                hero.querySelector(
                    "h1"
                );


            if (heroHeading) {

                heroHeading.textContent =
                    "Turn Every Meeting into Actionable Intelligence";

            }



            // =============================================
            // HERO DESCRIPTION
            // =============================================

            const heroParagraph =
                hero.querySelector(
                    "#hero .framer-1qb30mz p"
                );


            if (heroParagraph) {

                heroParagraph.textContent =
                    "Transform meetings into concise summaries, decisions, action items, insights, and searchable knowledge.";

            }



            // =============================================
            // HERO BADGE
            // =============================================

            const heroBadge =
                hero.querySelector(
                    "#hero .framer-pecz8h p"
                );


            if (heroBadge) {

                heroBadge.textContent =
                    "AI-powered meeting intelligence";

            }



            // =============================================
            // HERO BUTTON
            // =============================================

            const heroButton =
                hero.querySelector(
                    "#hero .framer-jirxrg a"
                );


            if (heroButton) {

                const buttonText =
                    heroButton.querySelector(
                        "p"
                    );


                if (buttonText) {

                    buttonText.textContent =
                        "Process a Meeting";

                }

                else {

                    heroButton.textContent =
                        "Process a Meeting";

                }


                heroButton.href =
                    "#new-meeting";


                heroButton.removeAttribute(
                    "data-framer-page-link-current"
                );


                heroButton.setAttribute(
                    "role",
                    "button"
                );


                heroButton.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();

                        goToNewMeeting();

                    },
                    true
                );

            }

        }



        // =================================================
        // ACTIVE CLEANUP OF LEGACY SECTIONS
        // =================================================

        function removeLegacySections() {
            const selectors = [
                '#pricing',
                '#comparison',
                '#testimonials',
                '[data-framer-name="Pricing"]',
                '[data-framer-name="Blogs"]',
                '[data-framer-name="Testimonials"]',
                '[data-framer-name="Comparison"]'
            ];
            selectors.forEach(function (sel) {
                document.querySelectorAll(sel).forEach(function (el) {
                    el.remove();
                });
            });
        }
        removeLegacySections();

        // =================================================
        // NAVIGATION
        // =================================================

        function setupNavigation() {
            const allLinks = document.querySelectorAll("nav a, footer a, #navLogo");

            allLinks.forEach(function (link) {
                const text = link.textContent.trim();
                const href = link.getAttribute("href") || "";

                if (text === "Dashboard" || text === "Home" || href === "#dashboard" || link.id === "navLogo") {
                    link.href = "#dashboard";
                    link.addEventListener("click", function (event) {
                        event.preventDefault();
                        goToDashboard();
                    });
                } else if (text === "New Meeting" || href === "#new-meeting") {
                    link.href = "#new-meeting";
                    link.addEventListener("click", function (event) {
                        event.preventDefault();
                        goToNewMeeting();
                    });
                } else if (text === "History" || text === "Changelog" || href === "#meeting-history") {
                    link.href = "#meeting-history";
                    link.addEventListener("click", function (event) {
                        event.preventDefault();
                        goToMeetingHistory();
                    });
                } else if (text === "Analytics" || text === "All Pages" || href === "#analytics") {
                    link.href = "#analytics";
                    link.addEventListener("click", function (event) {
                        event.preventDefault();
                        goToAnalytics();
                    });
                }
            });
        }
        setupNavigation();

        // =================================================
        // CREATE SECTIONS
        // =================================================

        createNewMeetingSection();
        createMeetingHistorySection();
        createAnalyticsSection();

        console.log("SmartMeet setup completed.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSmartMeet);
    } else {
        initSmartMeet();
    }
    window.addEventListener("load", initSmartMeet);
