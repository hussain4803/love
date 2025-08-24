// Global variables
let currentSection = 'pictures';
let editItemId = null;
let editItemType = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    loadAllData();
}

// Setup navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.dataset.section;
            switchSection(targetSection);
        });
    });
}

// Switch between sections
function switchSection(sectionName) {
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    currentSection = sectionName;
}

// Load all data
function loadAllData() {
    loadPictures();
    loadTodos();
    loadMusic();
    loadMessages();
}

// Show success/error messages
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const currentSection = document.querySelector('.section.active');
    currentSection.insertBefore(messageDiv, currentSection.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Form visibility functions
function showPictureForm() {
    document.getElementById('pictureForm').style.display = 'block';
    document.getElementById('imageFile').focus();
}

function hidePictureForm() {
    document.getElementById('pictureForm').style.display = 'none';
    document.getElementById('pictureForm').reset();
}

function showTodoForm() {
    document.getElementById('todoForm').style.display = 'block';
    document.getElementById('todoText').focus();
}

function hideTodoForm() {
    document.getElementById('todoForm').style.display = 'none';
    document.getElementById('todoForm').reset();
}

function showMusicForm() {
    document.getElementById('musicForm').style.display = 'block';
    document.getElementById('audioFile').focus();
}

function hideMusicForm() {
    document.getElementById('musicForm').style.display = 'none';
    document.getElementById('musicForm').reset();
}

function showMessageForm() {
    document.getElementById('messageForm').style.display = 'block';
    document.getElementById('messageAuthor').focus();
}

function hideMessageForm() {
    document.getElementById('messageForm').style.display = 'none';
    document.getElementById('messageForm').reset();
}

// Modal functions
function showEditModal(type, id, currentText, label = 'النص:') {
    editItemId = id;
    editItemType = type;
    
    document.getElementById('modalTitle').textContent = 'تعديل';
    document.getElementById('editLabel').textContent = label;
    document.getElementById('editText').value = currentText;
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editItemId = null;
    editItemType = null;
}

// Handle edit form submission
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newText = document.getElementById('editText').value;
    
    if (editItemType === 'picture') {
        updatePicture(editItemId, newText);
    } else if (editItemType === 'todo') {
        updateTodo(editItemId, newText);
    } else if (editItemType === 'music') {
        updateMusic(editItemId, newText);
    } else if (editItemType === 'message') {
        updateMessage(editItemId, newText);
    }
    
    closeEditModal();
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Pictures Functions
function loadPictures() {
    const gallery = document.getElementById('picturesGallery');
    gallery.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    fetch('https://backend-z01c.onrender.com/')
        .then(response => response.json())
        .then(pictures => {
            if (pictures.length === 0) {
                gallery.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <h3>لا توجد صور أو فيديوهات بعد</h3>
                        <p>ابدأ بإضافة أول صورة أو فيديو لموقع ذكرياتكم</p>
                    </div>
                `;
            } else {
                gallery.innerHTML = pictures.map(picture => createPictureCard(picture)).join('');
            }
        })
        .catch(error => {
            console.error('Error loading pictures:', error);
            gallery.innerHTML = '<div class="error">خطأ في تحميل الصور والفيديوهات</div>';
        });
}

function createPictureCard(picture) {
    const isVideo = picture.filename.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i);
    
    if (isVideo) {
        return `
            <div class="picture-card">
                <video controls>
                    <source src="/uploads/${picture.filename}" type="video/mp4">
                    <source src="/uploads/${picture.filename}" type="video/webm">
                    <source src="/uploads/${picture.filename}" type="video/ogg">
                    متصفحك لا يدعم تشغيل الفيديوهات.
                </video>
                <div class="picture-info">
                    <p class="picture-description">${picture.description || 'لا يوجد وصف'}</p>
                    <div class="picture-actions">
                        <button class="action-btn" onclick="showEditModal('picture', ${picture.id}, '${picture.description || ''}', 'وصف الفيديو:')">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePicture(${picture.id})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="picture-card">
                <img src="/uploads/${picture.filename}" alt="صورة" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlNmYyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmNjk5NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS4ieS4gOS4ieS4gDwvdGV4dD48L3N2Zz4='">
                <div class="picture-info">
                    <p class="picture-description">${picture.description || 'لا يوجد وصف'}</p>
                    <div class="picture-actions">
                        <button class="action-btn" onclick="showEditModal('picture', ${picture.id}, '${picture.description || ''}', 'وصف الصورة:')">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        <button class="action-btn delete-btn" onclick="deletePicture(${picture.id})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

function uploadPicture(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const imageFile = document.getElementById('imageFile').files[0];
    const description = document.getElementById('imageDescription').value;
    
    if (!imageFile) {
        showMessage('يرجى اختيار صورة أو فيديو', 'error');
        return;
    }
    
    formData.append('image', imageFile);
    formData.append('description', description);
    
    fetch('/api/pictures', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            hidePictureForm();
            loadPictures();
        }
    })
    .catch(error => {
        console.error('Error uploading picture:', error);
        showMessage('خطأ في رفع الملف', 'error');
    });
}

function updatePicture(id, description) {
    fetch(`/api/pictures/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            loadPictures();
        }
    })
    .catch(error => {
        console.error('Error updating picture:', error);
        showMessage('خطأ في تحديث الملف', 'error');
    });
}

function deletePicture(id) {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
        fetch(`/api/pictures/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage(data.error, 'error');
            } else {
                showMessage(data.message, 'success');
                loadPictures();
            }
        })
        .catch(error => {
            console.error('Error deleting picture:', error);
            showMessage('خطأ في حذف الملف', 'error');
        });
    }
}

// Todos Functions
function loadTodos() {
    const todosList = document.getElementById('todosList');
    todosList.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    fetch('https://backend-z01c.onrender.com/')
        .then(response => response.json())
        .then(todos => {
            if (todos.length === 0) {
                todosList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-list-check"></i>
                        <h3>لا توجد مهام بعد</h3>
                        <p>ابدأ بإضافة أول مهمة تريد القيام بها معاً</p>
                    </div>
                `;
            } else {
                todosList.innerHTML = todos.map(todo => createTodoItem(todo)).join('');
            }
        })
        .catch(error => {
            console.error('Error loading todos:', error);
            todosList.innerHTML = '<div class="error">خطأ في تحميل قائمة المهام</div>';
        });
}

function createTodoItem(todo) {
    return `
        <div class="todo-item">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id}, this.checked)">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <div class="todo-actions">
                <button class="action-btn" onclick="showEditModal('todo', ${todo.id}, '${todo.text}', 'نص المهمة:')">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="action-btn delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `;
}

function addTodo(event) {
    event.preventDefault();
    
    const text = document.getElementById('todoText').value.trim();
    
    if (!text) {
        showMessage('يرجى كتابة نص المهمة', 'error');
        return;
    }
    
    fetch('/api/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            hideTodoForm();
            loadTodos();
        }
    })
    .catch(error => {
        console.error('Error adding todo:', error);
        showMessage('خطأ في إضافة المهمة', 'error');
    });
}

function updateTodo(id, text) {
    fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, completed: false })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            loadTodos();
        }
    })
    .catch(error => {
        console.error('Error updating todo:', error);
        showMessage('خطأ في تحديث المهمة', 'error');
    });
}

function toggleTodo(id, completed) {
    fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
            loadTodos(); // Reload to reset checkbox state
        } else {
            // Update the UI immediately for better user experience
            const todoItem = document.querySelector(`[onchange="toggleTodo(${id}, this.checked)"]`).closest('.todo-item');
            const todoText = todoItem.querySelector('.todo-text');
            if (completed) {
                todoText.classList.add('completed');
            } else {
                todoText.classList.remove('completed');
            }
        }
    })
    .catch(error => {
        console.error('Error toggling todo:', error);
        showMessage('خطأ في تحديث حالة المهمة', 'error');
        loadTodos(); // Reload to reset checkbox state
    });
}

function deleteTodo(id) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
        fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage(data.error, 'error');
            } else {
                showMessage(data.message, 'success');
                loadTodos();
            }
        })
        .catch(error => {
            console.error('Error deleting todo:', error);
            showMessage('خطأ في حذف المهمة', 'error');
        });
    }
}

// Music Functions
function loadMusic() {
    const playlist = document.getElementById('musicPlaylist');
    playlist.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    fetch('https://backend-z01c.onrender.com/')
        .then(response => response.json())
        .then(tracks => {
            if (tracks.length === 0) {
                playlist.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-music"></i>
                        <h3>لا توجد مقطوعات موسيقية بعد</h3>
                        <p>ابدأ بإضافة أول مقطوعة موسيقية لموقع ذكرياتكم</p>
                    </div>
                `;
            } else {
                playlist.innerHTML = tracks.map(track => createMusicTrack(track)).join('');
            }
        })
        .catch(error => {
            console.error('Error loading music:', error);
            playlist.innerHTML = '<div class="error">خطأ في تحميل الموسيقى</div>';
        });
}

function createMusicTrack(track) {
    return `
        <div class="music-track">
            <div class="track-header">
                <h3 class="track-title">${track.title}</h3>
                <div class="track-actions">
                    <button class="action-btn" onclick="showEditModal('music', ${track.id}, '${track.title}', 'عنوان المقطوعة:')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteMusic(${track.id})">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
            <p class="track-description">${track.description || 'لا يوجد وصف'}</p>
            <audio class="audio-player" controls>
                <source src="/uploads/${track.filename}" type="audio/mpeg">
                <source src="/uploads/${track.filename}" type="audio/wav">
                <source src="/uploads/${track.filename}" type="audio/ogg">
                متصفحك لا يدعم تشغيل الملفات الصوتية.
            </audio>
        </div>
    `;
}

function uploadMusic(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const audioFile = document.getElementById('audioFile').files[0];
    const title = document.getElementById('musicTitle').value.trim();
    const description = document.getElementById('musicDescription').value.trim();
    
    if (!audioFile) {
        showMessage('يرجى اختيار ملف صوتي', 'error');
        return;
    }
    
    if (!title) {
        showMessage('يرجى كتابة عنوان المقطوعة', 'error');
        return;
    }
    
    formData.append('audio', audioFile);
    formData.append('title', title);
    formData.append('description', description);
    
    fetch('/api/music', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            hideMusicForm();
            loadMusic();
        }
    })
    .catch(error => {
        console.error('Error uploading music:', error);
        showMessage('خطأ في رفع المقطوعة', 'error');
    });
}

function updateMusic(id, title) {
    fetch(`/api/music/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            loadMusic();
        }
    })
    .catch(error => {
        console.error('Error updating music:', error);
        showMessage('خطأ في تحديث المقطوعة', 'error');
    });
}

function deleteMusic(id) {
    if (confirm('هل أنت متأكد من حذف هذه المقطوعة؟')) {
        fetch(`/api/music/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage(data.error, 'error');
            } else {
                showMessage(data.message, 'success');
                loadMusic();
            }
        })
        .catch(error => {
            console.error('Error deleting music:', error);
            showMessage('خطأ في حذف المقطوعة', 'error');
        });
    }
}

// Messages Functions
function loadMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    fetch('https://backend-z01c.onrender.com/')
        .then(response => response.json())
        .then(messages => {
            if (messages.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-envelope"></i>
                        <h3>لا توجد رسائل بعد</h3>
                        <p>ابدأ بكتابة أول رسالة حب لموقع ذكرياتكم</p>
                    </div>
                `;
            } else {
                messagesContainer.innerHTML = messages.map(message => createMessageCard(message)).join('');
            }
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = '<div class="error">خطأ في تحميل الرسائل</div>';
        });
}

function createMessageCard(message) {
    const date = new Date(message.created_date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="message-card">
            <div class="message-header">
                <span class="message-author">${message.author}</span>
                <span class="message-date">${date}</span>
            </div>
            <p class="message-text">${message.text}</p>
            <div class="message-actions">
                <button class="action-btn" onclick="showEditModal('message', ${message.id}, '${message.text}', 'نص الرسالة:')">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="action-btn delete-btn" onclick="deleteMessage(${message.id})">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `;
}

function addMessage(event) {
    event.preventDefault();
    
    const author = document.getElementById('messageAuthor').value.trim();
    const text = document.getElementById('messageText').value.trim();
    
    if (!author || !text) {
        showMessage('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    fetch('/api/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ author, text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            hideMessageForm();
            loadMessages();
        }
    })
    .catch(error => {
        console.error('Error adding message:', error);
        showMessage('خطأ في إضافة الرسالة', 'error');
    });
}

function updateMessage(id, text) {
    fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage(data.message, 'success');
            loadMessages();
        }
    })
    .catch(error => {
        console.error('Error updating message:', error);
        showMessage('خطأ في تحديث الرسالة', 'error');
    });
}

function deleteMessage(id) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        fetch(`/api/messages/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage(data.error, 'error');
            } else {
                showMessage(data.message, 'success');
                loadMessages();
            }
        })
        .catch(error => {
            console.error('Error deleting message:', error);
            showMessage('خطأ في حذف الرسالة', 'error');
        });
    }
}

