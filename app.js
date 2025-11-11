// ============================================
// HABIT TRACKER CLI - CHALLENGE 3
// ============================================
// NAMA: Era Indarsah
// KELAS: WPH-158 Batch 2 Rep 2
// TANGGAL: 11 November 2025
// ============================================

// TODO: Import module yang diperlukan
// HINT: readline, fs, path
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// TODO: Definisikan konstanta
// HINT: DATA_FILE, REMINDER_INTERVAL, DAYS_IN_WEEK
const DATA_FILE = 'habits-data.json';
const REMINDER_INTERVAL = 10000;
const DAYS_IN_WEEK = 7;

// TODO: Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================
// USER PROFILE OBJECT
// ============================================
// TODO: Buat object userProfile dengan properties:
// - name
// - joinDate
// - totalHabits
// - completedThisWeek
// TODO: Tambahkan method updateStats(habits)
// TODO: Tambahkan method getDaysJoined()
class UserProfile {
  constructor(name = 'User', joinDate = new Date()) {
    this.name = name;
    this.joinDate = new Date(joinDate);
    this.totalHabits = 0;
    this.completedThisWeek = 0;
    this.stats = {
      activeHabits: 0,
      completedHabits: 0,
      completionRate: 0,
    };
  }

  updateStats(habits) {
    const activeHabits = habits.filter((habit) => !habit.isCompletedThisWeek());
    const completedHabits = habits.filter((habit) =>
      habit.isCompletedThisWeek()
    );

    this.stats.activeHabits = activeHabits.length;
    this.stats.completedHabits = completedHabits.length;
    this.stats.completionRate =
      habits.length > 0
        ? Math.round((completedHabits.length / habits.length) * 100)
        : 0;

    this.totalHabits = habits.length;
    this.completedThisWeek = habits.reduce(
      (total, habit) => total + habit.completions.length,
      0
    );
  }

  getDaysJoined() {
    const today = new Date();
    const diffTime = Math.abs(today - this.joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  displayProfile() {
    console.log('\n==================================================');
    console.log('PROFIL PENGGUNA');
    console.log('==================================================');
    console.log(`Nama: ${this.name}`);
    console.log(
      `Bergabung sejak: ${this.joinDate.toLocaleDateString('id-ID')}`
    );
    console.log(`Lama bergabung: ${this.getDaysJoined()} hari`);
    console.log(`Total kebiasaan dibuat: ${this.totalHabits}`);
    console.log(`Total penyelesaian: ${this.completedThisWeek}`);
    console.log(`Kebiasaan aktif: ${this.stats.activeHabits}`);
    console.log(`Kebiasaan selesai: ${this.stats.completedHabits}`);
    console.log(`Tingkat penyelesaian: ${this.stats.completionRate}%`);
    console.log('==================================================\n');
  }
}

// ============================================
// HABIT CLASS
// ============================================
// TODO: Buat class Habit dengan:
// - Constructor yang menerima name dan targetFrequency
// - Method markComplete()
// - Method getThisWeekCompletions()
// - Method isCompletedThisWeek()
// - Method getProgressPercentage()
// - Method getStatus()

class Habit {
  constructor(
    id,
    name,
    targetFrequency,
    completions = [],
    createdAt = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.targetFrequency = targetFrequency;
    this.completions = completions.map((date) => new Date(date));
    this.createdAt = new Date(createdAt);
  }

  markComplete() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cek apakah sudah complete hari ini
    const alreadyCompleted = this.completions.some((completionDate) => {
      const compDate = new Date(completionDate);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === today.getTime();
    });

    if (!alreadyCompleted) {
      this.completions.push(today);
      return true;
    }
    return false;
  }

  getThisWeekCompletions() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return this.completions.filter((completionDate) => {
      const compDate = new Date(completionDate);
      return compDate >= startOfWeek;
    });
  }

  isCompletedThisWeek() {
    const thisWeekCompletions = this.getThisWeekCompletions();
    return thisWeekCompletions.length >= this.targetFrequency;
  }

  getProgressPercentage() {
    const thisWeekCompletions = this.getThisWeekCompletions();
    const percentage =
      (thisWeekCompletions.length / this.targetFrequency) * 100;
    return Math.min(Math.round(percentage), 100);
  }

  getStatus() {
    return this.isCompletedThisWeek() ? 'Selesai' : 'Aktif';
  }

  getProgressBar(width = 20) {
    const percentage = this.getProgressPercentage();
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  displayHabit(index) {
    const status = this.getStatus();
    const progressBar = this.getProgressBar();
    const thisWeekCompletions = this.getThisWeekCompletions();

    console.log(`\n${index}. [${status}] ${this.name}`);
    console.log(`   Target: ${this.targetFrequency}x/minggu`);
    console.log(
      `   Progress: ${thisWeekCompletions.length}/${
        this.targetFrequency
      } (${this.getProgressPercentage()}%)`
    );
    console.log(`   Progress Bar: ${progressBar}`);
  }
}

// ============================================
// HABIT TRACKER CLASS
// ============================================
// TODO: Buat class HabitTracker dengan:
// - Constructor
// - Method addHabit(name, frequency)
// - Method completeHabit(habitIndex)
// - Method deleteHabit(habitIndex)
// - Method displayProfile()
// - Method displayHabits(filter)
// - Method displayHabitsWithWhile()
// - Method displayHabitsWithFor()
// - Method displayStats()
// - Method startReminder()
// - Method showReminder()
// - Method stopReminder()
// - Method saveToFile()
// - Method loadFromFile()
// - Method clearAllData()
class HabitTracker {
  constructor() {
    this.userProfile = new UserProfile();
    this.habits = [];
    this.reminderInterval = null;
    this.nextHabitId = 1;
    this.loadFromFile();
  }

  // CRUD Operations
  addHabit(name, frequency) {
    const habit = new Habit(this.nextHabitId++, name, frequency);
    this.habits.push(habit);
    this.updateStats();
    this.saveToFile();
    console.log(`\n Kebiasaan "${name}" berhasil ditambahkan!`);
  }

  completeHabit(habitIndex) {
    const habit = this.habits[habitIndex - 1] ?? null;

    if (!habit) {
      console.log('\n Kebiasaan tidak ditemukan!');
      return;
    }

    if (habit.markComplete()) {
      console.log(
        `\n Kebiasaan "${habit.name}" berhasil ditandai selesai untuk hari ini!`
      );
      this.updateStats();
      this.saveToFile();
    } else {
      console.log(
        `\n Kebiasaan "${habit.name}" sudah ditandai selesai untuk hari ini!`
      );
    }
  }

  deleteHabit(habitIndex) {
    const habit = this.habits[habitIndex - 1] ?? null;

    if (!habit) {
      console.log('\n Kebiasaan tidak ditemukan!');
      return;
    }

    const habitName = habit.name;
    this.habits = this.habits.filter((_, index) => index !== habitIndex - 1);
    this.updateStats();
    this.saveToFile();
    console.log(`\n Kebiasaan "${habitName}" berhasil dihapus!`);
  }

  // Display Methods
  displayProfile() {
    this.userProfile.displayProfile();
  }

  displayHabits(filter = 'all') {
    console.log('\n==================================================');
    console.log('DAFTAR KEBIAASAAN');
    console.log('==================================================');

    let habitsToDisplay;

    switch (filter) {
      case 'active':
        habitsToDisplay = this.habits.filter((h) => !h.isCompletedThisWeek());
        console.log('FILTER: Kebiasaan Aktif\n');
        break;
      case 'completed':
        habitsToDisplay = this.habits.filter((h) => h.isCompletedThisWeek());
        console.log('FILTER: Kebiasaan Selesai\n');
        break;
      default:
        habitsToDisplay = this.habits;
        console.log('FILTER: Semua Kebiasaan\n');
    }

    if (habitsToDisplay.length === 0) {
      console.log('Tidak ada kebiasaan yang ditemukan.');
    } else {
      habitsToDisplay.forEach((habit, index) => {
        habit.displayHabit(index + 1);
      });
    }
    console.log('\n==================================================\n');
  }

  displayHabitsWithWhile() {
    console.log('\n==================================================');
    console.log('DEMO WHILE LOOP - Semua Kebiasaan');
    console.log('==================================================\n');

    let i = 0;
    while (i < this.habits.length) {
      const habit = this.habits[i];
      console.log(`${i + 1}. ${habit.name} (${habit.getStatus()})`);
      i++;
    }

    console.log('\n==================================================\n');
  }

  displayHabitsWithFor() {
    console.log('\n==================================================');
    console.log('DEMO FOR LOOP - Kebiasaan Aktif');
    console.log('==================================================\n');

    const activeHabits = this.habits.filter((h) => !h.isCompletedThisWeek());

    for (let i = 0; i < activeHabits.length; i++) {
      const habit = activeHabits[i];
      console.log(
        `${i + 1}. ${habit.name} - Progress: ${habit.getProgressPercentage()}%`
      );
    }

    console.log('\n==================================================\n');
  }

  displayStats() {
    console.log('\n==================================================');
    console.log('STATISTIK KEBIAASAAN');
    console.log('==================================================');

    if (this.habits.length === 0) {
      console.log('Belum ada data kebiasaan.');
      return;
    }

    // Menggunakan array methods untuk analisis data
    const completedThisWeek = this.habits.reduce(
      (total, habit) => total + habit.completions.length,
      0
    );

    const averageCompletion = Math.round(
      completedThisWeek / this.habits.length
    );

    const bestHabit = this.habits.reduce(
      (best, current) =>
        current.getProgressPercentage() > (best?.getProgressPercentage() ?? 0)
          ? current
          : best,
      null
    );

    const worstHabit = this.habits.reduce(
      (worst, current) =>
        current.getProgressPercentage() <
        (worst?.getProgressPercentage() ?? 100)
          ? current
          : worst,
      null
    );

    const habitCompletionRates = this.habits.map((habit) => ({
      name: habit.name,
      completionRate: habit.getProgressPercentage(),
    }));

    console.log(`Total kebiasaan: ${this.habits.length}`);
    console.log(
      `Rata-rata penyelesaian per kebiasaan: ${averageCompletion} kali`
    );
    console.log(`Total semua penyelesaian: ${completedThisWeek} kali`);

    console.log('\nKebiasaan dengan progress terbaik:');
    if (bestHabit) {
      console.log(
        `  - ${bestHabit.name}: ${bestHabit.getProgressPercentage()}%`
      );
    }

    console.log('\nKebiasaan yang perlu perhatian:');
    if (worstHabit && worstHabit.getProgressPercentage() < 100) {
      console.log(
        `  - ${worstHabit.name}: ${worstHabit.getProgressPercentage()}%`
      );
    }

    console.log('\nTingkat penyelesaian semua kebiasaan:');
    habitCompletionRates.forEach((habit) => {
      console.log(`  - ${habit.name}: ${habit.completionRate}%`);
    });

    console.log('\n==================================================\n');
  }

  // Reminder System
  startReminder() {
    if (this.reminderInterval) {
      this.stopReminder();
    }

    this.reminderInterval = setInterval(() => {
      this.showReminder();
    }, REMINDER_INTERVAL);
  }

  showReminder() {
    const incompleteHabits = this.habits.filter(
      (habit) => !habit.isCompletedThisWeek()
    );

    if (incompleteHabits.length > 0) {
      const randomHabit =
        incompleteHabits[Math.floor(Math.random() * incompleteHabits.length)];
      console.log('\n' + '='.repeat(50));
      console.log(`REMINDER: Jangan lupa ${randomHabit.name}!`);
      console.log('='.repeat(50) + '\n');
    }
  }

  stopReminder() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  // File Operations
  saveToFile() {
    try {
      const data = {
        userProfile: {
          name: this.userProfile.name,
          joinDate: this.userProfile.joinDate,
          totalHabits: this.userProfile.totalHabits,
          completedThisWeek: this.userProfile.completedThisWeek,
        },
        habits: this.habits,
        nextHabitId: this.nextHabitId,
      };

      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(DATA_FILE, jsonData);
    } catch (error) {
      console.log('Error menyimpan data:', error.message);
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const jsonData = fs.readFileSync(DATA_FILE, 'utf8');
        const data = JSON.parse(jsonData);

        // Menggunakan nullish coalescing untuk default values
        this.userProfile = new UserProfile(
          data.userProfile?.name ?? 'User',
          data.userProfile?.joinDate ?? new Date()
        );

        this.habits = (data.habits ?? []).map(
          (habitData) =>
            new Habit(
              habitData.id,
              habitData.name,
              habitData.targetFrequency,
              habitData.completions,
              habitData.createdAt
            )
        );

        this.nextHabitId = data.nextHabitId ?? 1;
        this.updateStats();

        console.log(' Data berhasil dimuat dari file.');
      }
    } catch (error) {
      console.log('Error memuat data:', error.message);
    }
  }

  clearAllData() {
    this.habits = [];
    this.nextHabitId = 1;
    this.userProfile = new UserProfile();
    this.saveToFile();
    console.log('\n Semua data berhasil dihapus!');
  }

  updateStats() {
    this.userProfile.updateStats(this.habits);
  }

  // Demo data untuk testing
  addDemoData() {
    this.addHabit('Minum Air 8 Gelas', 7);
    this.addHabit('Olahraga 30 Menit', 5);
    this.addHabit('Baca Buku 30 Menit', 5);
    this.addHabit('Meditasi 10 Menit', 7);

    // Simulasi beberapa completions
    const demoHabit = this.habits[0];
    demoHabit.markComplete();
    demoHabit.markComplete();

    console.log('\n Data demo berhasil ditambahkan!');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// TODO: Buat function askQuestion(question)
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// TODO: Buat function displayMenu()
function displayMenu() {
  console.log('\n==================================================');
  console.log('HABIT TRACKER - MAIN MENU');
  console.log('==================================================');
  console.log('1. Lihat Profil');
  console.log('2. Lihat Semua Kebiasaan');
  console.log('3. Lihat Kebiasaan Aktif');
  console.log('4. Lihat Kebiasaan Selesai');
  console.log('5. Tambah Kebiasaan Baru');
  console.log('6. Tandai Kebiasaan Selesai');
  console.log('7. Hapus Kebiasaan');
  console.log('8. Lihat Statistik');
  console.log('9. Demo Loop (while/for)');
  console.log('0. Keluar');
  console.log('==================================================');
}

// TODO: Buat async function handleMenu(tracker)
async function handleMenu(tracker) {
  while (true) {
    displayMenu();
    const choice = await askQuestion('Pilih menu (0-9): ');

    switch (choice) {
      case '1':
        tracker.displayProfile();
        break;

      case '2':
        tracker.displayHabits('all');
        break;

      case '3':
        tracker.displayHabits('active');
        break;

      case '4':
        tracker.displayHabits('completed');
        break;

      case '5':
        const name = await askQuestion('Nama kebiasaan: ');
        const frequency = await askQuestion('Target per minggu (angka): ');
        const freqNumber = parseInt(frequency) ?? 1;

        if (name && freqNumber > 0) {
          tracker.addHabit(name, freqNumber);
        } else {
          console.log('\n Input tidak valid!');
        }
        break;

      case '6':
        tracker.displayHabits('all');
        const completeIndex = await askQuestion(
          'Pilih nomor kebiasaan yang akan ditandai selesai: '
        );
        const completeNum = parseInt(completeIndex) ?? 0;

        if (completeNum > 0) {
          tracker.completeHabit(completeNum);
        } else {
          console.log('\n Nomor tidak valid!');
        }
        break;

      case '7':
        tracker.displayHabits('all');
        const deleteIndex = await askQuestion(
          'Pilih nomor kebiasaan yang akan dihapus: '
        );
        const deleteNum = parseInt(deleteIndex) ?? 0;

        if (deleteNum > 0) {
          tracker.deleteHabit(deleteNum);
        } else {
          console.log('\n Nomor tidak valid!');
        }
        break;

      case '8':
        tracker.displayStats();
        break;

      case '9':
        console.log('\n==================================================');
        console.log('DEMO LOOP');
        console.log('==================================================');
        tracker.displayHabitsWithWhile();
        tracker.displayHabitsWithFor();
        break;

      case '0':
        console.log('\nTerima kasih telah menggunakan Habit Tracker!');
        tracker.stopReminder();
        rl.close();
        return;

      default:
        console.log('\n Pilihan tidak valid! Silakan pilih 0-9.');
    }

    await askQuestion('Tekan Enter untuk melanjutkan...');
  }
}

// ============================================
// MAIN FUNCTION
// ============================================
// TODO: Buat async function main()
async function main() {
  console.log('==================================================');
  console.log('. HABIT TRACKER APPLICATION');
  console.log('==================================================');

  const tracker = new HabitTracker();
  tracker.startReminder();

  // Optional: Tambah data demo jika tidak ada data
  if (tracker.habits.length === 0) {
    const addDemo = await askQuestion('Tambah data demo? (y/N): ');
    if (addDemo.toLowerCase() === 'y') {
      tracker.addDemoData();
    }
  }

  try {
    await handleMenu(tracker);
  } catch (error) {
    console.log('Error:', error.message);
    tracker.stopReminder();
    rl.close();
  }
}

// TODO: Jalankan main() dengan error handling
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { HabitTracker, Habit, UserProfile };
