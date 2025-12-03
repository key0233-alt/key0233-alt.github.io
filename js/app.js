// 메인 애플리케이션 로직
(function() {
    let allPosts = [];
    let filteredPosts = [];
    let activeTags = new Set();
    
    // posts.json 로드
    async function loadPosts() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('posts.json을 불러올 수 없습니다.');
            }
            allPosts = await response.json();
            filteredPosts = allPosts;
            renderPosts();
            renderTagFilters();
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            document.getElementById('posts-container').innerHTML = 
                '<p class="loading">게시글을 불러올 수 없습니다.</p>';
        }
    }
    
    // 게시글 렌더링
    function renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;
        
        if (filteredPosts.length === 0) {
            container.innerHTML = '<p class="loading">표시할 게시글이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = filteredPosts.map(post => `
            <article class="post-card">
                <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHtml(post.title)}</a></h2>
                <div class="post-meta">
                    <span>📅 ${formatDate(post.date)}</span>
                    ${post.category ? `<span>📁 ${escapeHtml(post.category)}</span>` : ''}
                </div>
                ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </article>
        `).join('');
    }
    
    // 태그 필터 렌더링
    function renderTagFilters() {
        const container = document.getElementById('tag-filters');
        if (!container) return;
        
        const allTags = new Set();
        allPosts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        const sortedTags = Array.from(allTags).sort();
        
        container.innerHTML = sortedTags.map(tag => `
            <button class="tag-filter" data-tag="${escapeHtml(tag)}">
                ${escapeHtml(tag)}
            </button>
        `).join('');
        
        // 태그 필터 클릭 이벤트
        container.querySelectorAll('.tag-filter').forEach(button => {
            button.addEventListener('click', function() {
                const tag = this.getAttribute('data-tag');
                
                if (activeTags.has(tag)) {
                    activeTags.delete(tag);
                    this.classList.remove('active');
                } else {
                    activeTags.add(tag);
                    this.classList.add('active');
                }
                
                filterPosts();
            });
        });
    }
    
    // 게시글 필터링
    function filterPosts() {
        if (activeTags.size === 0) {
            filteredPosts = allPosts;
        } else {
            filteredPosts = allPosts.filter(post => {
                if (!post.tags || !Array.isArray(post.tags)) {
                    return false;
                }
                return Array.from(activeTags).some(tag => post.tags.includes(tag));
            });
        }
        
        renderPosts();
    }
    
    // 날짜 포맷팅
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }
    
    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 전역 함수로 노출 (search.js에서 사용)
    window.displayPosts = function(posts) {
        filteredPosts = posts;
        renderPosts();
    };
    
    // 초기 로드
    if (document.getElementById('posts-container')) {
        loadPosts();
    }
})();

