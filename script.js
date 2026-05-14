const CHANGMEN_LOCATION = {
    lat: 31.3222,
    lng: 120.6292
};

const CHECKIN_RADIUS = 100;

const AUTO_GUIDE_RADIUS = 100;

const guideSpots = [
    {
        id: 0,
        name: '阊门城楼',
        lat: 31.3222,
        lng: 120.6292,
        description: '阊门是苏州古城的西门，始建于春秋时期，是苏州城的重要门户。这里曾是明清时期最繁华的商业区，有金阊门之称。城楼气势恢宏，飞檐翘角，是苏州古城的标志性建筑之一。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20Changmen%20city%20gate%20ancient%20Chinese%20architecture%20stone%20bridge%20canal&image_size=landscape_16_9'
    },
    {
        id: 1,
        name: '阊门广场',
        lat: 31.3230,
        lng: 120.6285,
        description: '阊门广场位于阊门城楼前方，是游客聚集的重要场所。广场上有古运河码头，可乘坐游船游览运河美景，感受江南水乡的独特韵味。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20city%20square%20traditional%20Chinese%20architecture%20canal%20boats&image_size=landscape_16_9'
    },
    {
        id: 2,
        name: '运河岸边',
        lat: 31.3215,
        lng: 120.6300,
        description: '运河岸边是欣赏京杭大运河风光的最佳地点。这里可以看到古老的运河水脉，感受千年运河的历史变迁，是品味苏州水城魅力的好去处。',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20canal%20riverside%20traditional%20Chinese%20boats%20scenic%20view&image_size=landscape_16_9'
    }
];

let voiceGuideEnabled = true;
let currentUserLocation = null;
let lastNotifiedSpot = null;
let watchId = null;

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function checkIn() {
    const checkinBtn = document.querySelector('.checkin-btn');
    const statusDiv = document.getElementById('checkin-status');
    const messageSpan = document.getElementById('checkin-message');
    
    checkinBtn.disabled = true;
    checkinBtn.innerHTML = '<span class="checkin-icon">🔍</span><span>正在定位...</span>';
    statusDiv.classList.remove('success', 'error');
    messageSpan.textContent = '正在获取您的位置...';
    
    if (!navigator.geolocation) {
        checkinBtn.disabled = false;
        checkinBtn.innerHTML = '<span class="checkin-icon">📍</span><span>现场打卡</span>';
        statusDiv.classList.add('error');
        messageSpan.textContent = '您的浏览器不支持GPS定位';
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            const distance = calculateDistance(userLat, userLng, CHANGMEN_LOCATION.lat, CHANGMEN_LOCATION.lng);
            
            checkinBtn.disabled = false;
            checkinBtn.innerHTML = '<span class="checkin-icon">📍</span><span>现场打卡</span>';
            
            if (distance <= CHECKIN_RADIUS) {
                statusDiv.classList.remove('error');
                statusDiv.classList.add('success');
                messageSpan.textContent = `✅ 距离阊门约 ${Math.round(distance)} 米，打卡成功！`;
                document.getElementById('checkin-success').classList.add('active');
            } else {
                statusDiv.classList.remove('success');
                statusDiv.classList.add('error');
                const kmDistance = (distance / 1000).toFixed(1);
                messageSpan.textContent = `❌ 距离阊门约 ${kmDistance} 公里，请前往现场打卡`;
            }
        },
        function(error) {
            checkinBtn.disabled = false;
            checkinBtn.innerHTML = '<span class="checkin-icon">📍</span><span>现场打卡</span>';
            statusDiv.classList.add('error');
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    messageSpan.textContent = '❌ 请允许位置权限以进行打卡';
                    break;
                case error.POSITION_UNAVAILABLE:
                    messageSpan.textContent = '❌ 无法获取当前位置';
                    break;
                case error.TIMEOUT:
                    messageSpan.textContent = '❌ 获取位置超时，请重试';
                    break;
                default:
                    messageSpan.textContent = '❌ 定位失败，请重试';
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function closeCheckinModal() {
    document.getElementById('checkin-success').classList.remove('active');
}

function goToARGuide() {
    window.location.href = 'ar-guide.html';
}

function startLocationTracking() {
    if (!navigator.geolocation) {
        document.getElementById('location-status').textContent = '不支持定位';
        return;
    }
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            currentUserLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            const accuracy = position.coords.accuracy;
            document.getElementById('location-status').textContent = `定位中 (精度: ${Math.round(accuracy)}m)`;
            
            checkNearbySpots();
        },
        function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    document.getElementById('location-status').textContent = '请开启定位权限';
                    break;
                case error.POSITION_UNAVAILABLE:
                    document.getElementById('location-status').textContent = '无法获取位置';
                    break;
                case error.TIMEOUT:
                    document.getElementById('location-status').textContent = '定位超时';
                    break;
                default:
                    document.getElementById('location-status').textContent = '定位失败';
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        }
    );
}

function stopLocationTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function checkNearbySpots() {
    if (!currentUserLocation) return;
    
    for (const spot of guideSpots) {
        const distance = calculateDistance(
            currentUserLocation.lat,
            currentUserLocation.lng,
            spot.lat,
            spot.lng
        );
        
        if (distance <= AUTO_GUIDE_RADIUS && lastNotifiedSpot !== spot.id) {
            lastNotifiedSpot = spot.id;
            showGuideNotification(spot);
            if (voiceGuideEnabled) {
                speakText(`欢迎来到${spot.name}。${spot.description}`);
            }
            break;
        }
    }
}

function showGuideNotification(spot) {
    const modal = document.getElementById('guide-notification');
    document.getElementById('notification-title').textContent = spot.name;
    document.getElementById('notification-desc').textContent = spot.description;
    document.getElementById('notification-image').querySelector('img').src = spot.image;
    modal.classList.add('active');
}

function closeGuideNotification() {
    document.getElementById('guide-notification').classList.remove('active');
}

function toggleVoiceGuide() {
    voiceGuideEnabled = !voiceGuideEnabled;
    
    const voiceIcon = document.getElementById('voice-icon');
    const voiceText = document.getElementById('voice-text');
    const voiceStatus = document.getElementById('voice-status');
    
    if (voiceGuideEnabled) {
        voiceIcon.textContent = '🔊';
        voiceText.textContent = '语音解说';
        voiceStatus.textContent = '语音: 开启';
        speakText('语音解说已开启');
    } else {
        voiceIcon.textContent = '🔇';
        voiceText.textContent = '关闭语音';
        voiceStatus.textContent = '语音: 关闭';
        stopSpeaking();
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        stopSpeaking();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    }
}

function stopSpeaking() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
}

const spotsData = [
    {
        id: 0,
        name: '阊门城楼',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20Changmen%20city%20gate%20ancient%20Chinese%20architecture%20stone%20bridge%20canal&image_size=landscape_16_9',
        description: '阊门是苏州古城的西门，始建于春秋时期，是苏州城的重要门户。这里曾是明清时期最繁华的商业区，有"金阊门"之称。城楼气势恢宏，飞檐翘角，是苏州古城的标志性建筑之一。',
        hours: '08:00 - 17:30'
    },
    {
        id: 1,
        name: '山塘街',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20canal%20street%20Suzhou%20with%20boats%20and%20ancient%20buildings&image_size=landscape_16_9',
        description: '山塘街是一条有1100多年历史的古街，被誉为"姑苏第一名街"。街道依河而建，两旁是古色古香的店铺和民居，充满了江南水乡的韵味。',
        hours: '全天开放'
    },
    {
        id: 2,
        name: '留园',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20garden%20Suzhou%20with%20rockeries%20pavilion%20and%20pond&image_size=landscape_16_9',
        description: '留园是中国四大名园之一，始建于明代。园林以精巧的布局和丰富的景观著称，亭台楼阁、假山池沼、花木盆景相互映衬，体现了江南园林艺术的最高水平。',
        hours: '07:30 - 17:00'
    },
    {
        id: 3,
        name: '寒山寺',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20temple%20with%20pagoda%20Suzhou%20traditional%20architecture&image_size=landscape_16_9',
        description: '寒山寺始建于南朝梁代，因唐代诗人张继的《枫桥夜泊》而闻名天下。寺内古迹众多，钟声悠扬，是苏州著名的佛教圣地和旅游景点。',
        hours: '07:30 - 17:00'
    }
];

const quizQuestions = [
    {
        question: '阊门是苏州古城的哪个门？',
        options: ['东门', '西门', '南门', '北门'],
        answer: 1
    },
    {
        question: '京杭大运河苏州段开凿于哪个朝代？',
        options: ['唐朝', '隋朝', '宋朝', '元朝'],
        answer: 1
    },
    {
        question: '《枫桥夜泊》描写的是哪个景点？',
        options: ['虎丘', '寒山寺', '留园', '山塘街'],
        answer: 1
    },
    {
        question: '山塘街有多少年的历史？',
        options: ['500年', '800年', '1100年', '1500年'],
        answer: 2
    },
    {
        question: '阊门在明清时期有什么称号？',
        options: ['银阊门', '金阊门', '玉阊门', '铜阊门'],
        answer: 1
    },
    {
        question: '京杭大运河全长约多少公里？',
        options: ['1000公里', '1794公里', '2500公里', '3000公里'],
        answer: 1
    },
    {
        question: '阊门始建于哪个时期？',
        options: ['唐朝', '春秋时期', '明朝', '清朝'],
        answer: 1
    },
    {
        question: '以下哪个是苏州运河十景之一？',
        options: ['西湖', '枫桥夜泊', '太湖', '玄武湖'],
        answer: 1
    },
    {
        question: '大运河苏州段被列入世界文化遗产是在哪一年？',
        options: ['2008年', '2014年', '2018年', '2020年'],
        answer: 1
    },
    {
        question: '山塘街是由谁主持开凿的？',
        options: ['白居易', '苏东坡', '王安石', '范仲淹'],
        answer: 0
    },
    {
        question: '阊门曾是哪个朝代的重要商埠？',
        options: ['汉朝', '唐朝', '明清', '宋朝'],
        answer: 2
    },
    {
        question: '运河上的"水城门"是苏州的哪个门？',
        options: ['阊门', '胥门', '盘门', '娄门'],
        answer: 2
    },
    {
        question: '唐代诗人张继的《枫桥夜泊》写于哪里？',
        options: ['寒山寺', '灵岩寺', '西园寺', '报恩寺'],
        answer: 0
    },
    {
        question: '苏州运河最著名的古桥是？',
        options: ['宝带桥', '枫桥', '觅渡桥', '吴门桥'],
        answer: 1
    },
    {
        question: '阊门在太平天国时期曾被称为什么？',
        options: ['破城', '毁门', '鬼门', '断门'],
        answer: 2
    },
    {
        question: '大运河在苏州境内有多少公里？',
        options: ['30公里', '50公里', '80公里', '100公里'],
        answer: 1
    },
    {
        question: '以下哪个园林与阊门相邻？',
        options: ['拙政园', '留园', '艺圃', '耦园'],
        answer: 2
    },
    {
        question: '阊门内外曾是苏州最繁华的什么场所？',
        options: ['文化区', '商业区', '行政区', '住宅区'],
        answer: 1
    },
    {
        question: '《红楼梦》中提到的"阊门"位于哪里？',
        options: ['南京', '苏州', '杭州', '扬州'],
        answer: 1
    },
    {
        question: '苏州运河两岸的传统民居被称为？',
        options: ['水乡民居', '江南民居', '运河人家', '枕河人家'],
        answer: 3
    },
    {
        question: '阊门城楼重建于哪一年？',
        options: ['1999年', '2002年', '2006年', '2010年'],
        answer: 2
    },
    {
        question: '大运河的开凿对苏州的主要影响是？',
        options: ['军事防御', '经济繁荣', '文化传播', '农业发展'],
        answer: 1
    },
    {
        question: '以下哪个不是阊门的别称？',
        options: ['金阊', '吴门', '西阊', '南阊'],
        answer: 3
    },
    {
        question: '苏州运河中行驶的传统船只称为？',
        options: ['龙舟', '乌篷船', '漕船', '帆船'],
        answer: 1
    },
    {
        question: '阊门遗址公园位于哪里？',
        options: ['山塘街', '石路', '观前街', '平江路'],
        answer: 1
    }
];

let currentQuizIndex = 0;
let quizScore = 0;
let selectedOption = -1;
let currentQuestions = [];
let finalScore = 0;

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'quiz-page') {
        initQuiz();
    } else if (pageId === 'guide-page') {
        startLocationTracking();
    } else {
        stopLocationTracking();
    }
}

function showSpotDetail(index) {
    const spot = spotsData[index];
    document.getElementById('detail-image').querySelector('img').src = spot.image;
    document.getElementById('detail-title').textContent = spot.name;
    document.getElementById('detail-desc').textContent = spot.description;
    document.getElementById('detail-time').textContent = spot.hours;
    document.getElementById('spot-detail').classList.add('active');
}

function closeSpotDetail() {
    document.getElementById('spot-detail').classList.remove('active');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function initQuiz() {
    currentQuizIndex = 0;
    quizScore = 0;
    selectedOption = -1;
    
    const shuffled = shuffleArray(quizQuestions);
    currentQuestions = shuffled.slice(0, 5);
    
    updateQuiz();
    document.getElementById('result-overlay').classList.remove('active');
}

function updateQuiz() {
    const question = currentQuestions[currentQuizIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('opt0').textContent = question.options[0];
    document.getElementById('opt1').textContent = question.options[1];
    document.getElementById('opt2').textContent = question.options[2];
    document.getElementById('opt3').textContent = question.options[3];
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong');
    });
    
    document.getElementById('quiz-count').textContent = `${currentQuizIndex + 1}/${currentQuestions.length}`;
    document.getElementById('progress-fill').style.width = `${((currentQuizIndex + 1) / currentQuestions.length) * 100}%`;
    
    selectedOption = -1;
}

function selectOption(index) {
    if (selectedOption !== -1) return;
    
    selectedOption = index;
    const question = currentQuestions[currentQuizIndex];
    const optionBtns = document.querySelectorAll('.option-btn');
    
    optionBtns.forEach((btn, i) => {
        if (i === question.answer) {
            btn.classList.add('correct');
        } else if (i === index && i !== question.answer) {
            btn.classList.add('wrong');
        }
    });
    
    if (index === question.answer) {
        quizScore++;
    }
    
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function nextQuestion() {
    if (currentQuizIndex < currentQuestions.length - 1) {
        currentQuizIndex++;
        updateQuiz();
    } else {
        showResult();
    }
}

function showResult() {
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    
    finalScore = quizScore * 20;
    
    if (quizScore === currentQuestions.length) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = '太棒了！';
        resultText.textContent = `恭喜你获得满分${finalScore}分！你对苏州阊门的历史文化了如指掌！`;
    } else if (quizScore >= 3) {
        resultIcon.textContent = '🎉';
        resultTitle.textContent = '做得不错！';
        resultText.textContent = `你答对了${quizScore}题，获得${finalScore}分，继续加油！`;
    } else {
        resultIcon.textContent = '📚';
        resultTitle.textContent = '再接再厉';
        resultText.textContent = `你答对了${quizScore}题，获得${finalScore}分，多了解苏州文化吧！`;
    }
    
    document.getElementById('result-overlay').classList.add('active');
}

function restartQuiz() {
    initQuiz();
}

function generateNewCard() {
    const cardImages = [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20Changmen%20ancient%20city%20gate%20traditional%20Chinese%20painting%20style&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20traditional%20garden%20ink%20painting%20style%20beautiful%20scenery&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20canal%20boats%20traditional%20Chinese%20water%20town%20painting&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20ancient%20street%20traditional%20architecture%20Chinese%20style&image_size=landscape_16_9'
    ];
    
    const randomIndex = Math.floor(Math.random() * cardImages.length);
    document.querySelector('.card-header img').src = cardImages[randomIndex];
    
    updateCardDate();
    updateCardUsername();
    updateCardScore();
}

function updateCardDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('card-date').textContent = `${year}年${month}月${day}日`;
}

function updateCardUsername() {
    const usernameInput = document.getElementById('username-input');
    const cardUsername = document.getElementById('card-username');
    
    if (usernameInput) {
        const username = usernameInput.value.trim() || '游客';
        cardUsername.textContent = username;
    }
}

function updateCardScore() {
    const scoreValue = document.getElementById('card-score-value');
    if (scoreValue) {
        scoreValue.textContent = finalScore;
    }
}

function saveCardAsImage() {
    updateCardUsername();
    updateCardScore();
    
    const cardElement = document.getElementById('card-to-save');
    
    html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF8F5'
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `苏州阊门纪念卡_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        const saveModal = document.getElementById('save-success');
        saveModal.classList.add('active');
        
        setTimeout(() => {
            saveModal.classList.remove('active');
        }, 2000);
    }).catch(error => {
        console.error('保存失败:', error);
        alert('保存失败，请重试');
    });
}

function shareCard() {
    if (navigator.share) {
        navigator.share({
            title: '苏州阊门纪念卡片',
            text: '我在苏州阊门留下了美好的回忆！',
            url: window.location.href
        }).catch(() => {
            alert('分享功能暂不可用');
        });
    } else {
        alert('长按卡片保存图片分享给朋友吧！');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCardDate();
    updateCardScore();
    
    const usernameInput = document.getElementById('username-input');
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            updateCardUsername();
        });
    }
});

document.getElementById('spot-detail').addEventListener('click', (e) => {
    if (e.target === document.getElementById('spot-detail')) {
        closeSpotDetail();
    }
});

document.getElementById('checkin-success').addEventListener('click', (e) => {
    if (e.target === document.getElementById('checkin-success')) {
        closeCheckinModal();
    }
});

navigator.geolocation.getCurrentPosition = () => {
  return { coords: { latitude:31.3222, longitude:120.6292 } }
}