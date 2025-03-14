document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const postsList = document.getElementById('posts');
    const postModal = new bootstrap.Modal(document.getElementById('postModal'));
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const editTitle = document.getElementById('editTitle');
    const editBody = document.getElementById('editBody');
    const editForm = document.getElementById('editForm');
    let currentPostId;


    function getLocalPosts() {
        const posts = localStorage.getItem('posts');
        return posts ? JSON.parse(posts) : [];
    }

    function saveLocalPosts(posts) {
        localStorage.setItem('posts', JSON.stringify(posts));
    }


    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const body = document.getElementById('body').value;
        try {
            const newPost = await createPost({ title, body, userId: 1 });
            addPostToList(newPost);
            postForm.reset();
        } catch (error) {
            alert('Помилка при створенні поста: ' + error.message);
        }
    });


    postsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('list-group-item')) {
            const postId = parseInt(e.target.dataset.id);
            try {
                const post = await getPost(postId);
                modalTitle.textContent = post.title;
                modalBody.textContent = post.body;
                currentPostId = postId;
                postModal.show();
            } catch (error) {
                alert('Помилка при отриманні поста: ' + error.message);
            }
        }
    });


    document.getElementById('editButton').addEventListener('click', () => {
        editTitle.value = modalTitle.textContent;
        editBody.value = modalBody.textContent;
        postModal.hide();
        editModal.show();
    });


    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = editTitle.value;
        const body = editBody.value;
        try {
            const updatedPost = await updatePost(currentPostId, { title, body });
            updatePostInList(updatedPost);
            editModal.hide();
        } catch (error) {
            alert('Помилка при оновленні поста: ' + error.message);
        }
    });


    document.getElementById('deleteButton').addEventListener('click', async () => {
        try {
            await deletePost(currentPostId);
            removePostFromList(currentPostId);
            postModal.hide();
        } catch (error) {
            alert('Помилка при видаленні поста: ' + error.message);
        }
    });


    async function loadPosts() {
        try {
            const posts = await getPosts();
            posts.forEach(addPostToList);
        } catch (error) {
            alert('Помилка при завантаженні постів: ' + error.message);
        }
    }


    function addPostToList(post) {
        const li = document.createElement('li');
        li.textContent = post.title;
        li.dataset.id = post.id;
        li.classList.add('list-group-item');
        postsList.appendChild(li);
    }


    function updatePostInList(post) {
        const li = document.querySelector(`.list-group-item[data-id="${post.id}"]`);
        li.textContent = post.title;
    }


    function removePostFromList(postId) {
        const li = document.querySelector(`.list-group-item[data-id="${postId}"]`);
        li.remove();
    }


    async function getPosts() {
        const localPosts = getLocalPosts();
        if (localPosts.length === 0) {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            if (!response.ok) throw new Error('Не вдалося отримати пости');
            const posts = await response.json();
            saveLocalPosts(posts);
            return posts;
        } else {
            return localPosts;
        }
    }

    async function getPost(id) {
        const localPosts = getLocalPosts();
        const post = localPosts.find(p => p.id === id);
        if (post) return post;
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        if (!response.ok) throw new Error('Не вдалося отримати пост');
        return await response.json();
    }

    async function createPost(post) {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        if (!response.ok) throw new Error('Не вдалося створити пост');
        const newPost = await response.json();
        const localPosts = getLocalPosts();
        localPosts.push(newPost);
        saveLocalPosts(localPosts);
        return newPost;
    }

    async function updatePost(id, post) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        if (!response.ok) throw new Error('Не вдалося оновити пост');
        const updatedPost = await response.json();
        const localPosts = getLocalPosts();
        const index = localPosts.findIndex(p => p.id === id);
        if (index !== -1) {
            localPosts[index] = { ...localPosts[index], ...updatedPost };
            saveLocalPosts(localPosts);
            return localPosts[index];
        }
        throw new Error('Пост не знайдено');
    }

    async function deletePost(id) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Не вдалося видалити пост');
        const localPosts = getLocalPosts();
        const updatedPosts = localPosts.filter(p => p.id !== id);
        saveLocalPosts(updatedPosts);
    }
    loadPosts();
});