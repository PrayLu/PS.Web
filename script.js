/*
  ============================================================
  个人战略官网 - 交互逻辑说明 (script.js)
  ============================================================
  本文件负责页面的「行为」：导航、滚动动画、表单、轮播、视频滑动等。
  修改建议：
  - （导航栏已移除，initNavigation 已不再调用）
  - 改数字动画时长：在 animateCounter 里把 2000 改成毫秒数
  - 改用户心得轮播间隔：在 initTestimonialSlider 里把 5000 改成毫秒数
  - 接真实预约接口：在 initBookingForm 的 form submit 里把「模拟请求」换成 fetch(你的接口)
  - 接真实视频：在 initVideoPlayers 里把 alert 换成打开弹窗/跳转链接
  页面加载时会在 DOMContentLoaded 里依次调用下面各个 init 函数。
  ============================================================
*/

// ==================== 工具函数 ====================
// throttle：节流。在 limit 毫秒内最多执行一次 func，用于滚动、resize 等频繁事件，避免卡顿。
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
};

// debounce：防抖。连续触发时只在最后一次触发后 delay 毫秒执行，用于 resize、输入框等。
const debounce = (func, delay) => {
    let timeoutId;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
};

// 导航栏已移除，原 initNavigation 不再使用（点击锚点滚动由 initCTAButtons 和页脚链接负责，偏移改为 0）

// ==================== 滚动动画 ====================
// 用 IntersectionObserver 监听带 .section-animate 的区块：一旦进入视口（约 10% 可见）就加上 .visible，CSS 里会做淡入上移动画。rootMargin 负值表示「提前一点就算进入」。
const initScrollAnimations = () => {
    const animateElements = document.querySelectorAll('.section-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
};

// ==================== 数字滚动动画 ====================
// 项目简介里三个数据（已触达人数等）从 0 递增到 data-number。duration 是动画总时长（毫秒），改这里可变快/变慢。
const animateCounter = (element, target) => {
    const duration = 2000;  // 2 秒内从 0 变到 target，可改成 1500、3000 等
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
};

// 当任意一个 .stat-item 进入视口一半（threshold: 0.5）时，只执行一次：给所有 stat 的数字做递增动画。用 hasAnimated 保证不重复触发。
const initCounters = () => {
    const statItems = document.querySelectorAll('.stat-item');
    let hasAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statItems.forEach(item => {
                    const numberElement = item.querySelector('.stat-number');
                    const targetNumber = parseInt(item.dataset.number);
                    animateCounter(numberElement, targetNumber);
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    if (statItems.length > 0) {
        observer.observe(statItems[0]);
    }
};

// ==================== 用户心得轮播 ====================
// 三条用户心得自动轮播，每 5 秒切到下一条；点圆点可切换；手机触摸左/右滑也可切换。showTestimonial(index) 负责显示第 index 条并同步圆点。
const initTestimonialSlider = () => {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.testimonial-dot');
    let currentIndex = 0;
    let intervalId;
    
    const showTestimonial = (index) => {
        testimonials.forEach(t => t.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    };
    
    const nextTestimonial = () => {
        const next = (currentIndex + 1) % testimonials.length;
        showTestimonial(next);
    };
    
    const startAutoPlay = () => {
        intervalId = setInterval(nextTestimonial, 5000);  // 5 秒切换一次，可改成 3000、8000 等
    };
    
    const stopAutoPlay = () => {
        clearInterval(intervalId);
    };
    
    // 点击控制点
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showTestimonial(index);
            startAutoPlay();
        });
    });
    
    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        });
        
        const handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                nextTestimonial();
            }
            if (touchEndX > touchStartX + 50) {
                const prev = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
                showTestimonial(prev);
            }
        };
    }
    
    if (testimonials.length > 0) {
        startAutoPlay();
    }
};

// ==================== 表单验证和提交 ====================
// 绑定预约表单：姓名/手机/感兴趣领域必填；手机只能输入数字且最多 11 位；提交时先校验，再显示 loading，目前是模拟 1.5 秒后成功。接真实接口：把 await new Promise(...) 换成 await fetch(你的URL, { method: 'POST', body: ... })。
const initBookingForm = () => {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const interestInput = document.getElementById('interest');
    const submitButton = form.querySelector('.btn-submit');
    const successMessage = form.querySelector('.form-success');
    
    // 实时验证
    const validateField = (input) => {
        const formGroup = input.closest('.form-group');
        const isValid = input.checkValidity();
        
        if (isValid) {
            formGroup.classList.remove('has-error');
            input.classList.remove('error');
        } else {
            formGroup.classList.add('has-error');
            input.classList.add('error');
        }
        
        return isValid;
    };
    
    // 手机号格式验证
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
    });
    
    // 失去焦点时验证
    [nameInput, phoneInput, interestInput].forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value) {
                validateField(input);
            }
        });
        
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            formGroup.classList.remove('has-error');
            input.classList.remove('error');
        });
    });
    
    // 表单提交
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 验证所有字段
        const nameValid = validateField(nameInput);
        const phoneValid = validateField(phoneInput);
        const interestValid = validateField(interestInput);
        
        if (!nameValid || !phoneValid || !interestValid) {
            return;
        }
        
        // 显示加载状态
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        
        // 模拟 API 调用（接真实后端时把下面两行换成 fetch 请求）
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));  // 模拟延迟 1.5 秒
            
            // 收集表单数据（真实提交时可把 formData 作为 fetch 的 body）
            const formData = {
                name: nameInput.value,
                phone: phoneInput.value,
                interest: interestInput.value,
                timestamp: new Date().toISOString()
            };
            
            console.log('预约数据:', formData);
            
            // 显示成功消息
            form.style.display = 'none';
            successMessage.classList.add('show');
            
            // 3秒后重置表单
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                successMessage.classList.remove('show');
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }, 3000);
            
        } catch (error) {
            console.error('预约失败:', error);
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            alert('预约失败，请稍后再试');
        }
    });
};

// ==================== 返回顶部按钮 ====================
// 滚动超过 500px 时显示「返回顶部」按钮，点击平滑滚到页面顶部。改 500 可改「多少 px 后显示」。
const initBackToTop = () => {
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;
    
    const handleScroll = throttle(() => {
        if (window.scrollY > 500) {  // 超过 500px 显示返回顶部按钮，可改
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// ==================== 视频故事左右滑动 ====================
// 根据 .video-card 数量生成底部圆点；左/右箭头点击时滚动一张卡片的宽度；圆点点击跳到对应卡片；滚动时同步更新当前圆点和箭头 disabled 状态。getCardWidth 用来算「一张卡 + 间距」的宽度。
const initVideoStoriesSlider = () => {
    const track = document.getElementById('videoStoriesTrack');
    const dotsContainer = document.getElementById('videoStoriesDots');
    const prevBtn = document.querySelector('.video-stories-prev');
    const nextBtn = document.querySelector('.video-stories-next');
    
    if (!track || !dotsContainer) return;
    
    const cards = track.querySelectorAll('.video-card');
    const cardCount = cards.length;
    if (cardCount === 0) return;
    
    // 生成圆点
    dotsContainer.innerHTML = '';
    for (let i = 0; i < cardCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'video-stories-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `第 ${i + 1} 个视频`);
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('.video-stories-dot');
    
    const getCardWidth = () => {
        const first = cards[0];
        if (!first) return 320;
        const style = getComputedStyle(track);
        const gap = parseFloat(style.gap) || 16;
        return first.offsetWidth + gap;
    };
    
    const updateArrows = () => {
        const scrollLeft = track.scrollLeft;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (prevBtn) prevBtn.disabled = scrollLeft <= 1;
        if (nextBtn) nextBtn.disabled = maxScroll <= 1 || scrollLeft >= maxScroll - 1;
    };
    
    const updateDots = () => {
        const cardWidth = getCardWidth();
        const scrollLeft = track.scrollLeft;
        let index = Math.round(scrollLeft / cardWidth);
        index = Math.min(index, cardCount - 1);
        index = Math.max(0, index);
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    };
    
    const scrollToIndex = (index) => {
        const cardWidth = getCardWidth();
        const target = index * cardWidth;
        track.scrollTo({ left: target, behavior: 'smooth' });
    };
    
    // 左/右按钮
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
    }
    
    // 圆点点击
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => scrollToIndex(index));
    });
    
    // 滚动时更新圆点和箭头
    track.addEventListener('scroll', throttle(() => {
        updateDots();
        updateArrows();
    }, 80));
    
    // 初始化状态
    updateArrows();
};

// ==================== 视频播放器占位符点击事件 ====================
// 每个 .video-player 点击时目前是弹出提示。接真实视频：可在这里打开一个弹窗（modal），里面放 iframe 嵌 B 站/微信视频链接，或 window.open(视频页链接)。给每个 .video-player 加 data-video-url="链接" 再在这里读 this.dataset.videoUrl 即可。
const initVideoPlayers = () => {
    const videoPlayers = document.querySelectorAll('.video-player');
    
    videoPlayers.forEach(player => {
        player.addEventListener('click', () => {
            // 这里可以添加实际的视频播放逻辑
            // 例如: 打开模态框，嵌入 B 站/微信视频等；可用 player.closest('.video-card') 找到所在卡片，再读 data-video-url
            alert('视频播放功能待实现\n\n请在这里添加实际的视频URL');
        });
    });
};

// ==================== CTA 按钮平滑滚动 ====================
// 所有 href 以 # 开头的链接（如「立即预约」）点击时阻止默认跳转，改为平滑滚动到对应 id 的区块。href 为 # 的忽略。
const initCTAButtons = () => {
    const ctaButtons = document.querySelectorAll('a[href^="#"]');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const targetSection = document.querySelector(href);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop;  // 无导航栏，不需要偏移
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// ==================== 懒加载图片（可选） ====================
// 只有带 data-src 的图片会被懒加载：进入视口后才把 data-src 赋给 src。当前 HTML 里没有这类图片，若以后加了缩略图可保留。
const initLazyLoading = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
};

// ==================== 卡片悬浮 3D 微交互 ====================
// 鼠标在卡片上移动时，卡片随鼠标位置轻微 3D 倾斜并上浮；移出后恢复。不想要可注释掉 DOMContentLoaded 里的 initMicroInteractions()。
const initMicroInteractions = () => {
    const cards = document.querySelectorAll('.video-card, .case-item, .benefit-item, .article-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
};

// ==================== 彩蛋：Konami 代码 ====================
// 键盘依次按 上上下下左右左右 B A 会触发 3 秒彩虹滤镜动画。不需要可注释掉 DOMContentLoaded 里的 initEasterEgg()。
const initEasterEgg = () => {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    const activateEasterEgg = () => {
        // 添加彩虹色主题
        document.body.style.animation = 'rainbow 3s linear infinite';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            document.body.style.animation = '';
            style.remove();
        }, 3000);
    };
};

// ==================== 页面加载完成后初始化 ====================
// 等 HTML 解析完（不必等图片等全部加载）后执行。按顺序初始化各功能；最后让 body 淡入。若某功能不需要，注释掉对应那一行即可。
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 个人战略官网已加载');
    
    // 按需注释掉不需要的 init（导航栏已移除，不再调用 initNavigation）
    initScrollAnimations();
    initCounters();
    initTestimonialSlider();
    initBookingForm();
    initBackToTop();
    initVideoStoriesSlider();
    initVideoPlayers();
    initCTAButtons();
    initLazyLoading();
    initMicroInteractions();
    initEasterEgg();
    
    // 页面加载完成后的淡入效果
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== 窗口大小改变时的处理 ====================
// 导航栏已移除，此处仅保留 debounce 的 resize 监听；若以后加回导航，可在此处理小屏菜单关闭。
window.addEventListener('resize', debounce(() => {
    // 预留：从移动端切回桌面端时的逻辑（如恢复菜单状态）
}, 250));

// ==================== 页面可见性变化处理 ====================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停所有动画
        console.log('页面已隐藏');
    } else {
        // 页面可见时恢复动画
        console.log('页面已显示');
    }
});

// ==================== 导出到全局，供外部脚本或控制台调用 ====================
// 例如在控制台输入 PersonalStrategy.scrollToSection('#booking') 可滚动到预约区块；openVideo(url) 可扩展为打开视频。
window.PersonalStrategy = {
    scrollToSection: (sectionId) => {  // sectionId 如 '#intro'、'#booking'
        const section = document.querySelector(sectionId);
        if (section) {
            const offsetTop = section.offsetTop;  // 无导航栏，不需要偏移
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },
    
    openVideo: (videoUrl) => {
        // 可以在这里实现视频播放逻辑
        console.log('播放视频:', videoUrl);
    }
};
