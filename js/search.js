// 검색 기능
(function() {
    const searchInput = document.getElementById('search-input');
    let searchPosts = []; // 전역 변수 충돌 방지를 위해 고유한 이름 사용
    
    if (!searchInput) return;
    
    // posts.json에서 게시글 데이터 로드
    async function loadPosts() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('posts.json을 불러올 수 없습니다.');
            }
            searchPosts = await response.json();
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            searchPosts = [];
        }
    }
    
    // 검색 실행
    function performSearch(query) {
        if (!query.trim()) {
            return searchPosts;
        }
        
        const lowerQuery = query.toLowerCase();
        return searchPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(lowerQuery);
            const excerptMatch = post.excerpt.toLowerCase().includes(lowerQuery);
            const tagMatch = post.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            const categoryMatch = post.category.toLowerCase().includes(lowerQuery);
            
            return titleMatch || excerptMatch || tagMatch || categoryMatch;
        });
    }
    
    // 검색 이벤트 리스너
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        const filteredPosts = performSearch(query);
        
        // 검색 결과를 app.js의 displayPosts 함수에 전달
        if (window.displayPosts) {
            window.displayPosts(filteredPosts);
        }
    });
    
    // 초기 로드
    loadPosts();
})();

