// ✅ بيانات الحلقات
const episodesData = [
  {
    id: 1,
    title: "الحلقة 1",
    baseURL: "https://video.wixstatic.com/video/a225c5_5be486adab444083b2323983d50c6efe/"
  },
  {
    id: 2,
    title: "الحلقة 2",
    baseURL: "https://video.wixstatic.com/video/a225c5_a8805c5077e040ff85f935a3369364db/"
  },
  {
    id: 3,
    title: "الحلقة 3",
    baseURL: "https://video.wixstatic.com/video/a225c5_33e21df5c0eb4565910ab444811127bc/"
  },
  {
    id: 4,
    title: "الحلقة 4",
    baseURL: "https://video.wixstatic.com/video/a225c5_02e5b81878af4a67acb910870c2ba04e/"
  },
  {
    id: 5,
    title: "الحلقة 5",
    baseURL: "https://video.wixstatic.com/video/a225c5_0bc2fafc235f47ddad2c158e308c5e32/"
  },
  {
    id: 6,
    title: "الحلقة 6",
    baseURL: "https://video.wixstatic.com/video/a225c5_7d0de0cd771a4b93bced7c2e9f892f21/"
  },
  {
    id: 7,
    title: "الحلقة 7",
    baseURL: "https://video.wixstatic.com/video/a225c5_1d4b5b00855346468fdd30924155d32f/"
  },
  {
    id: 8,
    title: "الحلقة 8",
    baseURL: "https://video.wixstatic.com/video/a225c5_41e3ee363e404859a32078355a333be4/"
  },
  {
    id: 9,
    title: "الحلقة 9",
    baseURL: "https://video.wixstatic.com/video/a225c5_3c8dfb5f9aa440dc816a1387e30c4bba/"
  },
  {
    id: 10,
    title: "الحلقة 10",
    baseURL: "https://video.wixstatic.com/video/a225c5_9ffccf7b0e4645aab85249b458a54162/"
  },
  {
    id: 11,
    title: "الحلقة 11",
    baseURL: "https://video.wixstatic.com/video/a225c5_4db82112a059421aabec23748da53abc/"
  },
  {
    id: 12,
    title: "الحلقة 12",
    baseURL: "https://video.wixstatic.com/video/a225c5_b78f6550286d4987bd819713492697f3/"
  }
  // 🔑 أضف باقي الحلقات هنا حسب حاجتك
];

// ✅ دالة توليد رابط mp4 حسب الجودة
function generateVideoUrl(baseURL, quality) {
  return `${baseURL}${quality}/mp4/file.mp4`;
}

// ✅ إعداد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, update, get, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNLxujMnCsvpsfzqqYMVR4l9dT4teu_b8",
  authDomain: "watch-together-fa628.firebaseapp.com",
  databaseURL: "https://watch-together-fa628-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "watch-together-fa628",
  storageBucket: "watch-together-fa628.firebasestorage.app",
  messagingSenderId: "472062861048",
  appId: "1:472062861048:web:3710c75f6b72fef138e50d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const isHost = urlParams.get('host') === 'true';
const roomRef = ref(database, `rooms/${roomId}`);

// ** إضافة التحقق من وجود الحلقة عند بدء التشغيل **
get(child(roomRef, 'currentEpisode')).then((snapshot) => {
  if (!snapshot.exists()) {
    update(roomRef, {
      currentEpisode: 1,
      currentTime: 0,
      isPlaying: false,
      quality: "720p"
    });
  }
});

// عناصر الصفحة
const video = document.getElementById('videoPlayer');
const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');
const hostControls = document.getElementById('hostControls');

if (!isHost) {
  hostControls.style.display = 'none'; // إخفاء الأزرار للمشاهدين
}

// المستضيف: يرسل الحالة إلى Firebase
if (isHost) {
  video.addEventListener("play", () => {
    update(roomRef, { isPlaying: true });
  });

  video.addEventListener("pause", () => {
    update(roomRef, { isPlaying: false });
  });

  video.addEventListener("timeupdate", () => {
    update(roomRef, { currentTime: video.currentTime });
  });

  nextEpisodeBtn.addEventListener("click", () => {
    const newEpisodeId = prompt("أدخل رقم الحلقة الجديدة:", "2");
    if (newEpisodeId) {
      update(roomRef, {
        currentEpisode: parseInt(newEpisodeId, 10),
        currentTime: 0,
        isPlaying: false
      });
    }
  });
}

// المشاهدون: يستمعون للتغييرات من Firebase
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const episode = episodesData.find(ep => ep.id === data.currentEpisode);
  if (!episode) return;

  const videoUrl = generateVideoUrl(episode.baseURL, data.quality || "720p");

  if (video.src !== videoUrl) {
    video.src = videoUrl;
    video.load();
  }

  if (Math.abs(video.currentTime - data.currentTime) > 1) {
    video.currentTime = data.currentTime;
  }

  if (data.isPlaying && video.paused) {
    video.play().catch(console.error);
  } else if (!data.isPlaying && !video.paused) {
    video.pause();
  }
});
