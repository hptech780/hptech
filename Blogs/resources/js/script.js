document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blog-posts-row');

    // Fetch blog data from JSON file
    fetch('resources/json/blogData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Load likes and comments from localStorage
            const savedData = loadSavedData();
            const mergedPosts = mergePosts(data.posts, savedData);
            renderBlogPosts(mergedPosts);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    function loadSavedData() {
        const savedData = localStorage.getItem('blogData');
        return savedData ? JSON.parse(savedData) : {};
    }

    function mergePosts(posts, savedData) {
        return posts.map(post => {
            const savedPost = savedData[post.id] || { likes: [], comments: [] };
            return { ...post, ...savedPost };
        });
    }

    function renderBlogPosts(posts) {
        blogPostsContainer.innerHTML = ''; // Clear previous posts
        posts.forEach((post, postIndex) => {
            const card = createCard(post, postIndex);
            const col = document.createElement('div');
            col.classList.add('col-md-4', 'mb-4');
            col.appendChild(card);
            blogPostsContainer.appendChild(col);
        });
    }

    function createCard(post, postIndex) {
        const card = document.createElement('div');
        card.classList.add('card', 'h-100');

        const image = document.createElement('img');
        image.classList.add('card-img-top');
        image.src = post.imageSrc;
        image.alt = post.title;

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h5');
        title.classList.add('card-title');
        title.textContent = post.title;

        const description = document.createElement('p');
        description.classList.add('card-text', 'description');
        const shortDescription = post.description.substring(0, 30) + '...';
        description.innerHTML = shortDescription;

        const readMoreLink = document.createElement('a');
        readMoreLink.href = `blogPost.html?id=${post.id}`;
        readMoreLink.classList.add('btn', 'btn-primary', 'read-more');
        readMoreLink.textContent = 'Get More';

        cardBody.appendChild(image);
        cardBody.appendChild(title);
        cardBody.appendChild(description);
        cardBody.appendChild(readMoreLink);

        card.appendChild(cardBody);

        return card;
    }
});
