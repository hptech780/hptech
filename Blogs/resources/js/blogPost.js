document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blog-posts');

    // Fetch blog data from JSON file
    fetch('resources/json/blogData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Get the post ID from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            if (postId !== null) {
                const post = data.posts[postId];
                if (post) {
                    renderBlogPost(post);
                    updateMetaTags(post);
                } else {
                    console.error('Post not found');
                }
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    // Function to render a single blog post
    function renderBlogPost(post) {
        const card = createCard(post);
        blogPostsContainer.appendChild(card);
    }

    // Reuse the createCard function from script.js with minor modifications
    function createCard(post) {
        const card = document.createElement('div');
        card.classList.add('card', 'h-100');

        const image = document.createElement('img');
        // Remove Bootstrap class that constraints the image size
        // image.classList.add('card-img-top');
        image.src = post.imageSrc;
        image.alt = post.title;
        image.style.width = 'auto'; // Ensure the image keeps its actual width
        image.style.height = 'auto'; // Ensure the image keeps its actual height
        image.style.maxWidth = '100%'; // Ensure the image does not overflow its container

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
        readMoreLink.href = '#';
        readMoreLink.classList.add('btn', 'btn-primary', 'read-more');
        readMoreLink.textContent = 'Read More';
        readMoreLink.addEventListener('click', function(event) {
            event.preventDefault();
            const cardBody = readMoreLink.closest('.card-body');
            const description = cardBody.querySelector('.description');
            const isExpanded = cardBody.classList.contains('expanded');
            if (!isExpanded) {
                description.innerHTML = post.description;
                cardBody.classList.add('expanded');
                readMoreLink.textContent = 'Read Less';
            } else {
                description.innerHTML = shortDescription;
                cardBody.classList.remove('expanded');
                readMoreLink.textContent = 'Read More';
            }
        });

        const likesCount = document.createElement('span');
        likesCount.classList.add('badge', 'bg-primary', 'me-2', 'likes');
        renderLikes(post.likes, likesCount);

        const likeBtn = document.createElement('button');
        likeBtn.classList.add('btn', 'btn-primary', 'like-btn', 'me-2');
        likeBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
        likeBtn.setAttribute('aria-label', 'Like');
        likeBtn.addEventListener('click', function() {
            const userName = prompt('Enter your name:');
            if (userName) {
                const userLikedIndex = post.likes.findIndex(like => like.name === userName);
                if (userLikedIndex === -1) {
                    post.likes.push({ name: userName });
                } else {
                    post.likes.splice(userLikedIndex, 1); // Remove like
                }
                renderLikes(post.likes, likesCount);
                animateLike(likeBtn);
            }
        });

        const shareBtn = document.createElement('div');
        shareBtn.classList.add('btn-group', 'me-2');
        const shareDropdownBtn = document.createElement('button');
        shareDropdownBtn.classList.add('btn', 'btn-primary', 'dropdown-toggle');
        shareDropdownBtn.setAttribute('aria-label', 'Share');
        shareDropdownBtn.setAttribute('data-bs-toggle', 'dropdown');
        shareDropdownBtn.innerHTML = '<i class="fas fa-share"></i> Share';

        const shareDropdownMenu = document.createElement('ul');
        shareDropdownMenu.classList.add('dropdown-menu');
        shareDropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="#" onclick="sharePost('${post.title}', '${post.description}', '${post.imageSrc}', 'facebook')">Facebook</a></li>
            <li><a class="dropdown-item" href="#" onclick="sharePost('${post.title}', '${post.description}', '${post.imageSrc}', 'twitter')">Twitter</a></li>
            <li><a class="dropdown-item" href="#" onclick="sharePost('${post.title}', '${post.description}', '${post.imageSrc}', 'linkedin')">LinkedIn</a></li>
            <li><a class="dropdown-item" href="#" onclick="sharePost('${post.title}', '${post.description}', '${post.imageSrc}', 'instagram')">Instagram</a></li>
        `;

        shareBtn.appendChild(shareDropdownBtn);
        shareBtn.appendChild(shareDropdownMenu);

        const commentInput = document.createElement('input');
        commentInput.classList.add('form-control', 'me-2', 'comment-input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Add a comment...';

        const commentBtn = document.createElement('button');
        commentBtn.classList.add('btn', 'btn-secondary', 'comment-btn');
        commentBtn.textContent = 'Comment';
        commentBtn.addEventListener('click', function() {
            const userName = prompt('Enter your name:');
            if (userName) {
                const commentText = commentInput.value.trim();
                if (commentText !== '') {
                    post.comments.push({ name: userName, text: commentText });
                    renderComments(post.comments, commentsContainer);
                    commentInput.value = ''; // Clear input field after adding comment
                }
            }
        });

        const commentsContainer = document.createElement('div');
        commentsContainer.classList.add('comments');
        renderComments(post.comments, commentsContainer);

        const showAllCommentsBtn = document.createElement('button');
        showAllCommentsBtn.classList.add('btn', 'btn-primary', 'show-comments-btn', 'mb-2');
        showAllCommentsBtn.textContent = 'See All Comments';
        showAllCommentsBtn.addEventListener('click', function() {
            renderComments(post.comments, commentsContainer);
        });

        if (post.comments.length > 3) {
            cardBody.appendChild(showAllCommentsBtn); // Add "See All Comments" button if there are more than 3 comments
        }

        cardBody.appendChild(image);
        cardBody.appendChild(title);
        cardBody.appendChild(description);
        cardBody.appendChild(readMoreLink);
        cardBody.appendChild(document.createElement('br'));
        if (post.description.length > 30) {
            cardBody.appendChild(document.createElement('br'));
        }
        cardBody.appendChild(likesCount);
        cardBody.appendChild(likeBtn);
        cardBody.appendChild(shareBtn);
        cardBody.appendChild(document.createElement('br'));
        cardBody.appendChild(commentInput);
        cardBody.appendChild(commentBtn);
        cardBody.appendChild(commentsContainer);
        card.appendChild(cardBody);

        return card;
    }

    // Function to render likes
    function renderLikes(likes, container) {
        container.textContent = `Likes: ${likes.length}`;
    }

    // Function to render comments
    function renderComments(comments, container) {
        container.innerHTML = '';
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');
            commentElement.innerHTML = `<p class="comment-text">${comment.name}: ${comment.text}</p>`;
            container.appendChild(commentElement);
        });
    }

    // Function to animate like button
    function animateLike(button) {
        button.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            button.classList.remove('animate__animated', 'animate__rubberBand');
        }, 1000);
    }

    // Function to update Open Graph meta tags
    function updateMetaTags(post) {
        document.querySelector('meta[property="og:title"]').setAttribute('content', post.title);
        document.querySelector('meta[property="og:description"]').setAttribute('content', post.description);
        document.querySelector('meta[property="og:image"]').setAttribute('content', post.imageSrc); // Ensure the correct image URL is set here
        document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
    }

    // Function to share post
    window.sharePost = function(title, description, image, platform) {
        const url = encodeURIComponent(window.location.href);
        const encodedTitle = encodeURIComponent(title);
        const encodedDescription = encodeURIComponent(description);
        const encodedImage = encodeURIComponent(image);
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedTitle}&description=${encodedDescription}&picture=${encodedImage}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}&via=${encodedDescription}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${encodedTitle}&summary=${encodedDescription}&source=${encodedImage}`;
                break;
            case 'instagram':
                alert('Instagram sharing is not supported via URL. Please share the link manually.');
                return;
        }

        window.open(shareUrl, '_blank');
    }
});
