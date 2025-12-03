// 게시글 로더 (마크다운 파싱 및 Giscus 초기화)
(function() {
    // URL 파라미터에서 파일명 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');
    
    if (!fileName) {
        document.getElementById('post-container').innerHTML = 
            '<p class="loading">게시글을 찾을 수 없습니다.</p>';
        return;
    }
    
    // 게시글 로드
    async function loadPost() {
        try {
            const response = await fetch(`pages/${fileName}`);
            if (!response.ok) {
                throw new Error('게시글을 불러올 수 없습니다.');
            }
            
            let content = await response.text();
            
            // UTF-8 BOM 제거 (Windows 호환)
            if (content.charCodeAt(0) === 0xfeff) {
                content = content.slice(1);
            }
            
            // Front Matter 파싱
            const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
            let metadata = {};
            let postContent = content;
            
            if (frontMatterMatch) {
                const frontMatter = frontMatterMatch[1];
                postContent = frontMatterMatch[2];
                
                // Front Matter 라인 파싱
                const lines = frontMatter.split(/\r?\n/);
                lines.forEach(line => {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex > 0) {
                        const key = line.substring(0, colonIndex).trim();
                        let value = line.substring(colonIndex + 1).trim();
                        
                        // 따옴표 제거
                        if ((value.startsWith('"') && value.endsWith('"')) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.slice(1, -1);
                        }
                        
                        // 배열 파싱 (tags)
                        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
                            try {
                                value = JSON.parse(value);
                            } catch {
                                value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
                            }
                        }
                        
                        metadata[key] = value;
                    }
                });
            }
            
            // 마크다운을 HTML로 변환
            const htmlContent = marked.parse(postContent);
            
            // 페이지 제목 업데이트
            if (metadata.title) {
                document.title = `${metadata.title} - 블로그`;
            }
            
            // 게시글 렌더링
            renderPost(metadata, htmlContent);
            
            // 코드 하이라이팅 적용
            if (window.Prism) {
                Prism.highlightAll();
            }
            
            // Giscus 초기화
            loadGiscus(fileName);
            
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            document.getElementById('post-container').innerHTML = 
                '<p class="loading">게시글을 불러오는 중 오류가 발생했습니다.</p>';
        }
    }
    
    // 게시글 렌더링
    function renderPost(metadata, htmlContent) {
        const container = document.getElementById('post-container');
        if (!container) return;
        
        const date = metadata.date || new Date().toISOString().split('T')[0];
        const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
        
        container.innerHTML = `
            <h1>${escapeHtml(metadata.title || fileName.replace('.md', ''))}</h1>
            <div class="post-meta">
                <span>📅 ${formatDate(date)}</span>
                ${metadata.category ? `<span>📁 ${escapeHtml(metadata.category)}</span>` : ''}
            </div>
            ${tags.length > 0 ? `
                <div class="post-tags">
                    ${tags.map(tag => `<span class="post-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="post-content">
                ${htmlContent}
            </div>
        `;
    }
    
    // Giscus 로드
    function loadGiscus(fileName) {
        const container = document.getElementById('giscus-container');
        if (!container) return;
        
        // 기존 스크립트 제거
        const existingScript = document.querySelector('script[src*="giscus"]');
        if (existingScript) {
            existingScript.remove();
        }
        
        // Giscus 스크립트 생성
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'key0233-alt/key0233-alt.github.io');
        script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // 사용자가 Giscus 설정 후 교체 필요
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // 사용자가 Giscus 설정 후 교체 필요
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '1'); // 실시간 업데이트를 위해 반드시 1로 설정
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', 'preferred_color_scheme');
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('data-loading', 'lazy');
        script.crossOrigin = 'anonymous';
        
        container.appendChild(script);
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
    
    // 초기 로드
    loadPost();
})();

