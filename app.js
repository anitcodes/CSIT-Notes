// DOM Elements
const modal = document.getElementById('noteModal');
const createNoteBtn = document.getElementById('createNoteBtn');
const closeBtn = document.querySelector('.close');
const noteForm = document.getElementById('noteForm');
const notesGrid = document.querySelector('.notes-grid');
const searchInput = document.getElementById('searchNotes');
const globalSearchInput = document.getElementById('globalSearch');

// State management
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentNoteId = null;

// Add the subject data structure
const subjectsData = {
    1: { // First Semester
        'Computer Fundamentals & Applications': {
            chapters: [
                'Introduction to Computer Systems',
                'Computer Hardware',
                'Software Concepts',
                'Operating Systems',
                'Computer Networks',
                'Database Systems',
                'Computer Security',
                'Latest Trends in Computing'
            ],
            syllabus: [
                'Understanding computer basics',
                'Hardware components and their functions',
                'Software types and applications',
                'Operating system fundamentals',
                'Network basics and protocols'
            ],
            questions: [
                '2023 - Explain computer hardware components',
                '2022 - Describe the types of software',
                '2021 - What is an operating system?',
                'Model - Compare different types of networks',
                'Practice - List the basic components of a computer'
            ]
        },
        'Mathematics I': {
            // Add similar structure for other subjects
        }
        // Add other first semester subjects
    },
    // Add other semesters
};

// Add file handling functionality
const imageInput = document.getElementById('imageInput');
const documentInput = document.getElementById('documentInput');
const addImageBtn = document.getElementById('addImage');
const addDocumentBtn = document.getElementById('addDocument');
const attachmentsPreview = document.getElementById('attachmentsPreview');

// Store attachments
let noteAttachments = [];

// Event Listeners
createNoteBtn.addEventListener('click', () => {
    currentNoteId = null;
    noteForm.reset();
    openNoteModal();
});

closeBtn.addEventListener('click', () => {
    closeNoteModal();
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeNoteModal();
    }
});

noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(noteForm);
    const noteData = {
        id: currentNoteId || Date.now(),
        title: formData.get('title'),
        content: formData.get('content'),
        attachments: noteAttachments,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };

    if (currentNoteId) {
        const index = notes.findIndex(note => note.id === currentNoteId);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...noteData };
        }
    } else {
        notes.push(noteData);
    }

    saveNotes();
    renderNotes();
    closeNoteModal();
    noteForm.reset();
});

// Add search event listener
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterNotes(searchTerm);
    });
}

// Add global search functionality
if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (searchTerm.length < 2) {
            hideSearchResults();
            return;
        }
        performGlobalSearch(searchTerm);
    });
}

// Add keyboard shortcuts for search
document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchNotes');
    if (!searchInput) return;

    // Press '/' to focus search
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }

    // Press ESC to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        filterNotes('');
    }
});

// Add filter functionality
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // Apply filter
        const filterType = chip.getAttribute('data-filter');
        const searchTerm = document.getElementById('searchNotes').value;
        filterNotes(searchTerm, filterType);
    });
});

// Note management functions
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    
    let attachmentsHTML = '';
    if (note.attachments && note.attachments.length > 0) {
        attachmentsHTML = `
            <div class="note-attachments">
                ${note.attachments.map(attachment => {
                    if (attachment.type === 'image') {
                        return `
                            <div class="attachment-preview">
                                <img src="${attachment.data}" alt="${attachment.name}">
                            </div>
                        `;
                    } else {
                        return `
                            <div class="attachment-preview document">
                                <i class="fas fa-file-alt"></i>
                                <span>${attachment.name}</span>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }

    card.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content.substring(0, 150)}${note.content.length > 150 ? '...' : ''}</p>
        ${attachmentsHTML}
        <div class="note-meta">
            <span>${new Date(note.date).toLocaleDateString()}</span>
        </div>
        <div class="note-actions">
            <button onclick="editNote(${note.id})">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteNote(${note.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return card;
}

function renderNotes() {
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;
    
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    if (notes.length === 0) {
        showNoNotes();
        return;
    }

    notesGrid.innerHTML = '';
    notes.forEach(note => {
        const card = createNoteCard(note);
        notesGrid.appendChild(card);
    });
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentNoteId = id;
    const form = document.getElementById('noteForm');
    form.title.value = note.title;
    form.content.value = note.content;
    openNoteModal();
}

function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Initialize
renderNotes();

// Function to show subject details
function showSubjectDetails(subjectName, semester) {
    console.log(`Loading subject: ${subjectName} from semester ${semester}`);
    
    // Hide main content and semester grid
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('semesterGrid').style.display = 'none';
    
    // Show subject details section
    const subjectDetails = document.getElementById('subjectDetails');
    if (subjectDetails) {
        subjectDetails.style.display = 'block';
        
        // Set subject title
        const subjectTitle = document.getElementById('subjectTitle');
        if (subjectTitle) {
            subjectTitle.textContent = subjectName;
        }

        // Update the home link to handle navigation
        const homeLink = document.querySelector('.nav-links a[href="#"]');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                hideSubjectDetails();
            });
        }

        // Load content for each tab
        const chapterList = document.querySelector('.chapter-list');
        if (chapterList) {
            chapterList.innerHTML = `
                <div class="chapter-item">
                    <h3>Chapter 1: Introduction to ${subjectName}</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 2: Basic Concepts</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 3: Advanced Topics</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 4: Implementation Techniques</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 5: Practical Applications</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 6: Case Studies</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 7: Modern Trends</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
                <div class="chapter-item">
                    <h3>Chapter 8: Future Perspectives</h3>
                    <div class="chapter-resources">
                        <a href="#" class="resource-link"><i class="fas fa-file-pdf"></i> Notes</a>
                        <a href="#" class="resource-link"><i class="fas fa-video"></i> Video</a>
                        <a href="#" class="resource-link"><i class="fas fa-tasks"></i> Practice</a>
                    </div>
                </div>
            `;
        }

        // Enhanced syllabus section
        const syllabusContent = document.querySelector('.syllabus-content');
        if (syllabusContent) {
            syllabusContent.innerHTML = `
                <div class="syllabus-section">
                    <div class="syllabus-header">
                        <i class="fas fa-bullseye"></i>
                        <h3>Course Objectives</h3>
                    </div>
                    <ul class="objective-list">
                        <li><i class="fas fa-check-circle"></i> Understand core concepts of ${subjectName}</li>
                        <li><i class="fas fa-check-circle"></i> Develop practical skills in problem-solving</li>
                        <li><i class="fas fa-check-circle"></i> Master theoretical foundations</li>
                        <li><i class="fas fa-check-circle"></i> Apply concepts in real-world scenarios</li>
                    </ul>
                </div>

                <div class="syllabus-section">
                    <div class="syllabus-header">
                        <i class="fas fa-book"></i>
                        <h3>Course Contents</h3>
                    </div>
                    <div class="course-units">
                        <div class="unit-card">
                            <div class="unit-header">
                                <span class="unit-number">Unit 1</span>
                                <h4>Introduction</h4>
                                <span class="hours">10 Hours</span>
                            </div>
                            <ul class="unit-topics">
                                <li>Basic concepts and terminology</li>
                                <li>Historical development</li>
                                <li>Modern applications</li>
                            </ul>
                        </div>

                        <div class="unit-card">
                            <div class="unit-header">
                                <span class="unit-number">Unit 2</span>
                                <h4>Core Concepts</h4>
                                <span class="hours">15 Hours</span>
                            </div>
                            <ul class="unit-topics">
                                <li>Fundamental principles</li>
                                <li>Key methodologies</li>
                                <li>Standard practices</li>
                            </ul>
                        </div>

                        <div class="unit-card">
                            <div class="unit-header">
                                <span class="unit-number">Unit 3</span>
                                <h4>Advanced Topics</h4>
                                <span class="hours">12 Hours</span>
                            </div>
                            <ul class="unit-topics">
                                <li>Advanced techniques</li>
                                <li>Complex problem solving</li>
                                <li>Case studies</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="syllabus-section">
                    <div class="syllabus-header">
                        <i class="fas fa-book-reader"></i>
                        <h3>Reference Materials</h3>
                    </div>
                    <div class="reference-materials">
                        <div class="reference-card">
                            <i class="fas fa-book"></i>
                            <div class="reference-details">
                                <h4>Textbook</h4>
                                <p>"Complete Guide to ${subjectName}"</p>
                                <span class="author">By John Smith</span>
                            </div>
                        </div>
                        <div class="reference-card">
                            <i class="fas fa-globe"></i>
                            <div class="reference-details">
                                <h4>Online Resources</h4>
                                <p>Course Website</p>
                                <a href="#" class="resource-link">Visit Resource</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="syllabus-section">
                    <div class="syllabus-header">
                        <i class="fas fa-graduation-cap"></i>
                        <h3>Evaluation Scheme</h3>
                    </div>
                    <div class="evaluation-grid">
                        <div class="evaluation-item">
                            <div class="eval-header">Internal Assessment</div>
                            <div class="eval-value">40%</div>
                            <ul class="eval-details">
                                <li>Assignments: 15%</li>
                                <li>Mid-term: 15%</li>
                                <li>Practicals: 10%</li>
                            </ul>
                        </div>
                        <div class="evaluation-item">
                            <div class="eval-header">Final Examination</div>
                            <div class="eval-value">60%</div>
                            <ul class="eval-details">
                                <li>Theory: 40%</li>
                                <li>Practical: 20%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }

        // Example questions
        const yearList = document.querySelector('.year-list');
        yearList.innerHTML = `
            <a href="#" class="question-link">2023 Past Questions</a>
            <a href="#" class="question-link">2022 Past Questions</a>
            <a href="#" class="question-link">2021 Past Questions</a>
            <a href="#" class="question-link">2020 Past Questions</a>
            <a href="#" class="question-link">2019 Past Questions</a>
        `;

        const modelQuestions = document.querySelector('.model-questions');
        modelQuestions.innerHTML = `
            <a href="#" class="question-link">Model Question Set 1</a>
            <a href="#" class="question-link">Model Question Set 2</a>
            <a href="#" class="question-link">Model Question Set 3</a>
            <a href="#" class="question-link">Practice Questions</a>
            <a href="#" class="question-link">Sample Solutions</a>
        `;
    }
}

// Add styles for empty state
const styles = document.createElement('style');
styles.textContent = `
    .no-notes {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: var(--shadow);
    }
    
    .no-notes i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .no-notes h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--secondary-color);
    }
    
    .no-notes p {
        color: #64748b;
    }
`;
document.head.appendChild(styles);

// Add these new functions
function filterNotes(searchTerm, filterType = 'all') {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    let filteredNotes = notes;

    // Apply search term filter
    if (searchTerm) {
        filteredNotes = notes.filter(note => {
            const matchTitle = note.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchContent = note.content.toLowerCase().includes(searchTerm.toLowerCase());
            
            switch (filterType) {
                case 'title':
                    return matchTitle;
                case 'content':
                    return matchContent;
                default:
                    return matchTitle || matchContent;
            }
        });
    }

    // Apply additional filters
    switch (filterType) {
        case 'recent':
            filteredNotes = filteredNotes.sort((a, b) => 
                new Date(b.lastModified) - new Date(a.lastModified)
            ).slice(0, 5);
            break;
    }

    // Render filtered notes
    renderFilteredNotes(filteredNotes, searchTerm);
}

function renderFilteredNotes(notes, searchTerm) {
    const notesGrid = document.getElementById('notesGrid');
    notesGrid.innerHTML = '';

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        // Highlight matching text
        const highlightedTitle = highlightText(note.title, searchTerm);
        const highlightedContent = highlightText(note.content, searchTerm);
        
        card.innerHTML = `
            <h3>${highlightedTitle}</h3>
            <p>${highlightedContent.substring(0, 150)}${highlightedContent.length > 150 ? '...' : ''}</p>
            <div class="note-meta">
                <span>${new Date(note.date).toLocaleDateString()}</span>
            </div>
            <div class="note-actions">
                <button onclick="editNote(${note.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteNote(${note.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        notesGrid.appendChild(card);
    });
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function showNoResults(searchTerm) {
    const notesGrid = document.getElementById('notesGrid');
    notesGrid.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No Results Found</h3>
            <p>No notes found matching "${searchTerm}"</p>
        </div>
    `;
}

function showNoNotes() {
    const notesGrid = document.getElementById('notesGrid');
    notesGrid.innerHTML = `
        <div class="no-notes">
            <i class="fas fa-book-open"></i>
            <h3>No Notes Yet</h3>
            <p>Click the "Add Notes" button to create your first note!</p>
        </div>
    `;
}

function performGlobalSearch(searchTerm) {
    const results = [];
    
    // Search through all semesters and subjects
    for (const [semester, subjects] of Object.entries(subjectsData)) {
        for (const [subjectName, subjectContent] of Object.entries(subjects)) {
            // Search in chapters
            subjectContent.chapters?.forEach(chapter => {
                if (chapter.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'chapter',
                        semester,
                        subject: subjectName,
                        content: chapter
                    });
                }
            });

            // Search in syllabus
            subjectContent.syllabus?.forEach(item => {
                if (item.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'syllabus',
                        semester,
                        subject: subjectName,
                        content: item
                    });
                }
            });

            // Search in questions
            subjectContent.questions?.forEach(question => {
                if (question.toLowerCase().includes(searchTerm)) {
                    results.push({
                        type: 'question',
                        semester,
                        subject: subjectName,
                        content: question
                    });
                }
            });
        }
    }

    displaySearchResults(results, searchTerm);
}

function displaySearchResults(results, searchTerm) {
    const semesterGrid = document.getElementById('semesterGrid');
    const searchResults = document.createElement('div');
    searchResults.id = 'searchResults';
    searchResults.className = 'search-results';

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Results Found</h3>
                <p>No matches found for "${searchTerm}"</p>
            </div>
        `;
    } else {
        // Group results by type
        const groupedResults = results.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
            return acc;
        }, {});

        let resultsHTML = '<div class="search-results-content">';
        
        // Display results by type
        for (const [type, items] of Object.entries(groupedResults)) {
            resultsHTML += `
                <div class="result-section">
                    <h3>${type.charAt(0).toUpperCase() + type.slice(1)}s</h3>
                    <div class="result-items">
                        ${items.map(item => `
                            <div class="result-item" onclick="navigateToContent('${item.semester}', '${item.subject}', '${type}', '${item.content}')">
                                <div class="result-icon">
                                    <i class="fas ${getIconForType(type)}"></i>
                                </div>
                                <div class="result-details">
                                    <h4>${highlightText(item.content, searchTerm)}</h4>
                                    <p>${item.subject} (Semester ${item.semester})</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        resultsHTML += '</div>';
        searchResults.innerHTML = resultsHTML;
    }

    // Hide semester grid and show search results
    semesterGrid.style.display = 'none';
    
    // Remove existing search results if any
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        existingResults.remove();
    }
    
    semesterGrid.parentNode.insertBefore(searchResults, semesterGrid.nextSibling);
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    const semesterGrid = document.getElementById('semesterGrid');
    
    if (searchResults) {
        searchResults.remove();
    }
    
    semesterGrid.style.display = 'grid';
}

function getIconForType(type) {
    switch (type) {
        case 'chapter':
            return 'fa-book-open';
        case 'syllabus':
            return 'fa-list';
        case 'question':
            return 'fa-question-circle';
        default:
            return 'fa-file';
    }
}

function navigateToContent(semester, subject, type, content) {
    showSubjectDetails(subject, semester);
    
    // Switch to appropriate tab based on type
    const tabMapping = {
        'chapter': 'chapters',
        'syllabus': 'syllabus',
        'question': 'questions'
    };
    
    const tabBtn = document.querySelector(`[data-tab="${tabMapping[type]}"]`);
    if (tabBtn) {
        tabBtn.click();
    }
}

// Add mobile keyboard handling
if (window.innerWidth <= 640) {
    const modal = document.querySelector('.modal');
    const noteForm = document.getElementById('noteForm');
    const inputs = noteForm.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            modal.classList.add('keyboard-open');
            // Scroll the input into view with a delay to account for keyboard
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });

        input.addEventListener('blur', () => {
            modal.classList.remove('keyboard-open');
        });
    });

    // Handle viewport height changes (keyboard appearance)
    let viewportHeight = window.innerHeight;
    window.addEventListener('resize', () => {
        const newViewportHeight = window.innerHeight;
        const heightDiff = viewportHeight - newViewportHeight;
        
        if (heightDiff > 150) {
            // Keyboard is likely visible
            document.documentElement.style.setProperty('--keyboard-height', `${heightDiff}px`);
        } else {
            document.documentElement.style.setProperty('--keyboard-height', '0px');
        }
        
        viewportHeight = newViewportHeight;
    });
}

// Improve modal open/close animations
function openNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.style.display = 'block';
    // Add smooth entrance
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        if (window.innerWidth <= 640) {
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    });
}

function closeNoteModal() {
    const modal = document.getElementById('noteModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }, 300);
}

// Update hideSubjectDetails function
function hideSubjectDetails() {
    const subjectDetails = document.getElementById('subjectDetails');
    const mainContent = document.getElementById('mainContent');
    const semesterGrid = document.getElementById('semesterGrid');
    
    if (subjectDetails) {
        subjectDetails.style.display = 'none';
    }
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    if (semesterGrid) {
        semesterGrid.style.display = 'grid';
    }

    // Reset URL if needed
    history.pushState({}, '', '/');
}

// Add click handlers for attachment buttons
addImageBtn.addEventListener('click', () => imageInput.click());
addDocumentBtn.addEventListener('click', () => documentInput.click());

// Handle image upload
imageInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            try {
                const attachment = await handleFileUpload(file, 'image');
                noteAttachments.push(attachment);
                displayAttachmentPreview(attachment);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            }
        }
    }
    imageInput.value = ''; // Reset input
});

// Handle document upload
documentInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    for (const file of files) {
        try {
            const attachment = await handleFileUpload(file, 'document');
            noteAttachments.push(attachment);
            displayAttachmentPreview(attachment);
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document. Please try again.');
        }
    }
    documentInput.value = ''; // Reset input
});

// Handle file upload and conversion
async function handleFileUpload(file, type) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve({
                id: Date.now(),
                type: type,
                name: file.name,
                data: reader.result,
                size: file.size
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Display attachment preview
function displayAttachmentPreview(attachment) {
    const preview = document.createElement('div');
    preview.className = `attachment-item ${attachment.type}`;
    preview.dataset.id = attachment.id;

    if (attachment.type === 'image') {
        preview.innerHTML = `
            <img src="${attachment.data}" alt="${attachment.name}">
            <button class="remove-attachment" onclick="removeAttachment(${attachment.id})">
                <i class="fas fa-times"></i>
            </button>
            <div class="attachment-name">${attachment.name}</div>
        `;
    } else {
        preview.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div class="attachment-name">${attachment.name}</div>
            <button class="remove-attachment" onclick="removeAttachment(${attachment.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
    }

    attachmentsPreview.appendChild(preview);
}

// Remove attachment
function removeAttachment(id) {
    noteAttachments = noteAttachments.filter(attachment => attachment.id !== id);
    const preview = document.querySelector(`.attachment-item[data-id="${id}"]`);
    if (preview) {
        preview.remove();
    }
} 