document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoryNameInput = document.getElementById('categoryName');
    const categoriesDiv = document.getElementById('categories');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const toggleBallIcon = document.querySelector('.toggle-ball i');
    const downloadBtn = document.getElementById('downloadBtn');

    loadCategories();
    loadDarkMode();

    addCategoryBtn.addEventListener('click', addCategory);
    darkModeToggle.addEventListener('change', toggleDarkMode);
    downloadBtn.addEventListener('click', downloadCategories);

    function addCategory() {
        const categoryName = categoryNameInput.value.trim();
        if (categoryName) {
            createCategoryElement(categoryName);
            saveCategory(categoryName);
            categoryNameInput.value = '';
        }
    }

    function createCategoryElement(categoryName) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category card';
        categoryDiv.innerHTML = `
            <div class="card-header">
                <h5 class="d-inline">${categoryName}</h5>
                <button class="btn btn-primary btn-sm float-right" onclick="deleteCategory(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="input-group mb-3">
                    <input type="text" class="form-control linkTitle" placeholder="Link Title">
                    <input type="text" class="form-control linkUrl" placeholder="Link URL">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button" onclick="addLink(this)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <ul class="list-group linkList">
                    <!-- Links will be appended here -->
                </ul>
            </div>
        `;
        categoriesDiv.appendChild(categoryDiv);
    }

    window.addLink = function(button) {
        const linkTitle = button.parentElement.previousElementSibling.previousElementSibling.value.trim();
        const linkUrl = button.parentElement.previousElementSibling.value.trim();
        if (linkTitle && linkUrl) {
            // Validate and format the link URL
            const formattedUrl = formatUrl(linkUrl);
            const linkList = button.closest('.card-body').querySelector('.linkList');
            const linkItem = document.createElement('li');
            linkItem.className = 'list-group-item';
            linkItem.innerHTML = `
                <a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${linkTitle}</a>
                <button class="btn btn-primary btn-sm float-right" onclick="deleteLink(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            linkList.appendChild(linkItem);
            saveLink(button.closest('.category').querySelector('h5').textContent, linkTitle, linkUrl);
        }
    }

    function formatUrl(url) {
        try {
            // If the URL does not start with http:// or https://, add http://
            let formattedUrl = url.trim();
            if (!/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = 'http://' + formattedUrl;
            }
            new URL(formattedUrl); // Check if it's a valid URL
            return formattedUrl;
        } catch (e) {
            console.error('Invalid URL:', url);
            return ''; // Return an empty string if the URL is invalid
        }
    }

    window.deleteCategory = function(button) {
        const categoryDiv = button.closest('.category');
        const categoryName = categoryDiv.querySelector('h5').textContent;
        categoryDiv.remove();
        removeCategoryFromStorage(categoryName);
    }

    window.deleteLink = function(button) {
        const linkItem = button.closest('li');
        const categoryName = button.closest('.category').querySelector('h5').textContent;
        const linkTitle = linkItem.querySelector('a').textContent;
        linkItem.remove();
        removeLinkFromStorage(categoryName, linkTitle);
    }

    function saveCategory(categoryName) {
        let categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories.push({ name: categoryName, links: [] });
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function saveLink(categoryName, linkTitle, linkUrl) {
        let categories = JSON.parse(localStorage.getItem('categories'));
        const category = categories.find(cat => cat.name === categoryName);
        category.links.push({ title: linkTitle, url: linkUrl });
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function removeCategoryFromStorage(categoryName) {
        let categories = JSON.parse(localStorage.getItem('categories'));
        categories = categories.filter(cat => cat.name !== categoryName);
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function removeLinkFromStorage(categoryName, linkTitle) {
        let categories = JSON.parse(localStorage.getItem('categories'));
        const category = categories.find(cat => cat.name === categoryName);
        category.links = category.links.filter(link => link.title !== linkTitle);
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function loadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        categories.forEach(category => {
            createCategoryElement(category.name);
            category.links.forEach(link => {
                const categoryDiv = [...document.querySelectorAll('.category')].find(cat => cat.querySelector('h5').textContent === category.name);
                const linkList = categoryDiv.querySelector('.linkList');
                const linkItem = document.createElement('li');
                linkItem.className = 'list-group-item';
                linkItem.innerHTML = `
                    <a href="${encodeURI(link.url)}" target="_blank" rel="noopener noreferrer">${link.title}</a>
                    <button class="btn btn-primary btn-sm float-right" onclick="deleteLink(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                linkList.appendChild(linkItem);
            });
        });
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = document.body.classList.contains('dark-mode') ? 'fa-moon' : 'fa-sun';
        toggleBallIcon.className = `fas ${icon}`;
        saveDarkModePreference();
    }

    function saveDarkModePreference() {
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', darkModeEnabled.toString());
    }

    function loadDarkMode() {
        const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        if (darkModeEnabled) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
            toggleBallIcon.className = 'fas fa-moon';
        } else {
            toggleBallIcon.className = 'fas fa-sun';
        }
    }

    function downloadCategories() {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const blob = new Blob([JSON.stringify(categories, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'categories.json';
        a.click();
        URL.revokeObjectURL(url);
    }
});
