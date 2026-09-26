/**
 * Greek for the interface, keyed by the English source string.
 *
 * Anything missing falls back to the English it was keyed from, so a gap reads
 * as untranslated rather than as a broken key. Keys must match the source
 * exactly, including the typographic dashes and curly apostrophes the copy uses.
 *
 * Key names are deliberately absent — Esc, Ctrl, Shift, Space, WASD and the
 * letter keys are printed on the keyboard in Latin whatever language the page
 * is in, so they fall through untouched on purpose.
 */
export const UI: Record<string, string> = {
  /* ------------------------------ the lift --------------------------- */
  'The lift': 'Το ασανσέρ',
  Floor: 'Όροφος',
  Reception: 'Υποδοχή',
  /* Τα χρόνια δίπλα στο όνομα του ορόφου. */
  '2023–2024': '2023–2024',
  '2024–present': '2024–σήμερα',
  'you are here': 'είσαι εδώ',
  'Step back out': 'Βγες πάλι έξω',
  'You are on this floor already.': 'Είσαι ήδη σε αυτόν τον όροφο.',
  'Nothing happens.': 'Δεν γίνεται τίποτα.',
  'You press it. The button does not light — but somewhere above you, something heavy shifts in the shaft.':
    'Το πατάς. Το κουμπί δεν ανάβει — αλλά κάπου από πάνω σου, κάτι βαρύ μετακινείται μέσα στο φρεάτιο.',
  'The floor is there. Poured, wired, empty. The lift was built to reach it.':
    'Ο όροφος είναι εκεί. Χυμένος, καλωδιωμένος, άδειος. Το ασανσέρ χτίστηκε για να τον φτάνει.',
  'IBM taught him how large systems actually fail. Veltiston AI taught him how to build one fast enough to matter, for people who feel it on a Monday morning.':
    'Η IBM τού έμαθε πώς αποτυγχάνουν στ’ αλήθεια τα μεγάλα συστήματα. Η Veltiston AI τού έμαθε πώς να χτίζει ένα αρκετά γρήγορα ώστε να μετράει, για ανθρώπους που το νιώθουν ένα πρωινό Δευτέρας.',
  'So: third floor. Nobody has decided what it is yet.':
    'Λοιπόν: τρίτος όροφος. Κανείς δεν έχει αποφασίσει ακόμη τι είναι.',
  'You could.': 'Εσύ θα μπορούσες.',

  /* ------------------------------- HUD ------------------------------- */
  'Kitsos Island': 'Το Νησί του Κίτσου',
  Map: 'Χάρτης',
  'Map (M)': 'Χάρτης (M)',
  Journal: 'Ημερολόγιο',
  'Journal (J)': 'Ημερολόγιο (J)',
  Games: 'Παιχνίδια',
  'Quit game': 'Έξοδος',
  'Say hi': 'Πες γεια',
  Settings: 'Ρυθμίσεις',
  Day: 'Μέρα',
  Night: 'Νύχτα',
  Torch: 'Δάδα',
  Dark: 'Σκοτάδι',
  Light: 'Φακός',
  Walk: 'Βάδην',
  Running: 'Τρέξιμο',
  In: 'Κοντά',
  Out: 'Μακριά',
  Next: 'Επόμενο',
  Close: 'Κλείσιμο',
  Skip: 'Προσπέραση',
  'Pick an answer': 'Διάλεξε απάντηση',
  discovered: 'ανακαλύφθηκαν',
  'Not found yet': 'Δεν βρέθηκε ακόμη',
  locked: 'κλειδωμένο',
  'Island games (P)': 'Παιχνίδια του νησιού (P)',
  'Contact & full CV (C)': 'Επικοινωνία & πλήρες βιογραφικό (C)',
  'Flashlight, torch, or out (T)': 'Φακός, δάδα ή τίποτα (T)',
  'Keep running, the same as holding Shift':
    'Συνεχές τρέξιμο, το ίδιο με το κράτημα του Shift',
  'Zoom in (= or the wheel)': 'Ζουμ κοντά (= ή η ροδέλα)',
  'Zoom out (- or the wheel)': 'Ζουμ μακριά (- ή η ροδέλα)',
  'Sound, music, quality, and the controls':
    'Ήχος, μουσική, ποιότητα και χειριστήρια',
  'Map, journal, games, day or night, and the camera':
    'Χάρτης, ημερολόγιο, παιχνίδια, μέρα ή νύχτα και η κάμερα',
  'First person (X)': 'Πρώτο πρόσωπο (X)',
  'Climb (Shift)': 'Άνοδος (Shift)',
  'Sink (Ctrl)': 'Κάθοδος (Ctrl)',
  'Fly up': 'Πέτα ψηλότερα',
  'Fly down': 'Κατέβα',
  'Turn the camera left (Q)': 'Στρίψε την κάμερα αριστερά (Q)',
  'Turn the camera right (E)': 'Στρίψε την κάμερα δεξιά (E)',
  'The light stays as it is until the game is over':
    'Το φως μένει όπως είναι μέχρι να τελειώσει το παιχνίδι',
  'Nothing stays alight in the water': 'Τίποτα δεν μένει αναμμένο στο νερό',
  'The lights stay out until the game is over':
    'Τα φώτα μένουν σβηστά μέχρι να τελειώσει το παιχνίδι',
  'Day or night (L)': 'Μέρα ή νύχτα (L)',
  'Drag the stick to walk, tap A to interact':
    'Σύρε τον μοχλό για να περπατήσεις, πάτα A για αλληλεπίδραση',
  'WASD to walk · Shift to sprint · M for the map':
    'WASD για περπάτημα · Shift για τρέξιμο · M για τον χάρτη',
  'Space to fly · double-tap Space to drop · hold to pull up':
    'Space για πτήση · διπλό Space για βουτιά · κράτα το για ανάκαμψη',
  'Party in the plaza': 'Γλέντι στην πλατεία',
  'Press the button again to call it a night':
    'Πάτα ξανά το κουμπί για να σχολάσει το γλέντι',
  'Walk into the middle of the floor': 'Πήγαινε στη μέση της πίστας',

  /* ----------------------------- Settings ---------------------------- */
  Language: 'Γλώσσα',
  Music: 'Μουσική',
  Sound: 'Ήχος',
  Quality: 'Ποιότητα',
  Controls: 'Χειριστήρια',
  Off: 'Κλειστό',
  Auto: 'Αυτόματο',
  High: 'Υψηλή',
  Low: 'Χαμηλή',
  'Steps down if the island runs slow':
    'Χαμηλώνει μόνη της αν το νησί πάει αργά',
  'Shadows always on': 'Πάντα με σκιές',
  'Shadows off, fastest': 'Χωρίς σκιές, το πιο γρήγορο',
  'Auto found this machine short of 30fps and turned shadows off. High overrules it.':
    'Το αυτόματο βρήκε το μηχάνημα κάτω από 30fps και έκλεισε τις σκιές. Η υψηλή το παρακάμπτει.',

  /* ----------------------------- Progress ---------------------------- */
  Progress: 'Πρόοδος',
  'Clear progress': 'Σβήσιμο προόδου',
  'This cannot be undone. Walk it all again?':
    'Δεν γίνεται να αναιρεθεί. Να ξαναγυρίσεις το νησί από την αρχή;',
  'Clear it': 'Σβήσ’ το',
  'Keep it': 'Κράτα το',
  'Progress cleared': 'Η πρόοδος σβήστηκε',
  'Starting over': 'Από την αρχή',
  'The journal, the keyring and everything found have been forgotten.':
    'Το ημερολόγιο, τα κλειδιά και ό,τι βρέθηκε ξεχάστηκαν.',

  /* --------------------------- Controls list -------------------------- */
  Move: 'Κίνηση',
  Sprint: 'Τρέξιμο',
  Interact: 'Αλληλεπίδραση',
  Jump: 'Άλμα',
  'Turn camera': 'Περιστροφή κάμερας',
  Zoom: 'Ζουμ',
  'Map & travel': 'Χάρτης & ταξίδι',
  'Day / night': 'Μέρα / νύχτα',
  'Torch / flashlight': 'Δάδα / φακός',
  'Contact & CV': 'Επικοινωνία & βιογραφικό',
  'Games board': 'Πίνακας παιχνιδιών',
  'Shoot paint': 'Ρίψη μπογιάς',
  'Get down': 'Σκύψε',
  Wheelie: 'Σούζα',
  'Burner / vent': 'Καυστήρας / βαλβίδα',
  'Water bomb': 'Βόμβα νερού',
  Confetti: 'Κομφετί',
  'Swing the beam': 'Στρίψε τη δέσμη',
  'Wide pulse': 'Πλατύς παλμός',
  'Back / leave': 'Πίσω / έξοδος',
  'WASD / Arrows': 'WASD / Βελάκια',
  'Space / click': 'Space / κλικ',
  'Wheel, - and =': 'Ροδέλα, - και =',
  'Q and R': 'Q και R',
  'A and D': 'A και D',

  /* ------------------------------ Toasts ----------------------------- */
  'Journal updated': 'Το ημερολόγιο ενημερώθηκε',
  'Key obtained': 'Βρέθηκε κλειδί',
  'New mission': 'Νέα αποστολή',
  'Quality changed': 'Άλλαξε η ποιότητα',
  'Shadows off': 'Σκιές κλειστές',
  'The island was running slow, so it stepped itself down. The Quality button puts it back.':
    'Το νησί πήγαινε αργά, οπότε χαμήλωσε μόνο του. Το κουμπί της ποιότητας το επαναφέρει.',

  /* ---------------------------- Title screen -------------------------- */
  'A playable CV': 'Ένα βιογραφικό που παίζεται',
  KITSOS: 'ΚΙΤΣΟΣ',
  ISLAND: 'ΝΗΣΙ',
  'Walk the island, talk to the townspeople and step inside the buildings. Five keys are hidden across the districts, one per building. Find them all and the Old Lighthouse on the cape opens. The Radio Center down south sends a message straight to my inbox.':
    'Περπάτησε το νησί, μίλησε στους κατοίκους και μπες στα κτίρια. Πέντε κλειδιά είναι κρυμμένα στις συνοικίες, ένα σε κάθε κτίριο. Βρες τα όλα και ανοίγει ο Παλιός Φάρος στο ακρωτήρι. Το Ραδιοφωνικό Κέντρο στον νότο στέλνει μήνυμα κατευθείαν στα εισερχόμενά μου.',
  'Start exploring': 'Ξεκίνα την εξερεύνηση',
  'In a hurry? Get the full CV and my contact details':
    'Βιάζεσαι; Πάρε το πλήρες βιογραφικό και τα στοιχεία επικοινωνίας μου',
  move: 'κίνηση',
  sprint: 'τρέξιμο',
  interact: 'αλληλεπίδραση',
  jump: 'άλμα',
  'turn camera': 'περιστροφή κάμερας',
  'map & travel': 'χάρτης & ταξίδι',
  journal: 'ημερολόγιο',
  'On a phone? Use the stick and the A button.':
    'Σε κινητό; Χρησιμοποίησε τον μοχλό και το κουμπί A.',

  /* ------------------------------ Greeting ---------------------------- */
  'A word from Kitsos': 'Δυο λόγια από τον Κίτσο',
  'A word from the island’s owner': 'Δυο λόγια από τον οικοδεσπότη του νησιού',
  'Hey, nice to meet you!': 'Γεια σου, χαίρω πολύ!',
  'Fair warning: you’ll miss all the fun.':
    'Να το ξέρεις: θα χάσεις όλη την πλάκα.',
  'The island is the good part: the people, the buildings, the five keys and the lighthouse at the end of it.':
    'Το νησί είναι το ωραίο κομμάτι: οι άνθρωποι, τα κτίρια, τα πέντε κλειδιά και ο φάρος στο τέλος.',
  'But I genuinely appreciate the time you spend on my island, and I know a CV is sometimes just a thing you need right now. So here it is, no keys required.':
    'Εκτιμώ όμως ειλικρινά τον χρόνο που αφιερώνεις στο νησί μου, και ξέρω ότι ένα βιογραφικό είναι καμιά φορά κάτι που απλώς το χρειάζεσαι τώρα. Ορίστε λοιπόν, χωρίς κλειδιά.',
  'Either way, I would be very happy to connect. Say hello and I will answer. There is no one else on the other end.':
    'Έτσι κι αλλιώς, θα χαρώ πολύ να τα πούμε. Πες μου ένα γεια και θα απαντήσω. Δεν υπάρχει κανείς άλλος στην άλλη άκρη.',
  'Open the full CV again': 'Άνοιξε ξανά το πλήρες βιογραφικό',
  'Unlock the full CV': 'Ξεκλείδωσε το πλήρες βιογραφικό',
  'Send me a message': 'Στείλε μου μήνυμα',
  '…actually, let me explore the island': '…για στάσου, ας εξερευνήσω το νησί',

  /* ------------------------------- Panel ------------------------------ */
  'Take a copy of the CV': 'Πάρε αντίγραφο του βιογραφικού',
  'Download CV': 'Λήψη βιογραφικού',
  Saved: 'Αποθηκεύτηκε',
  'Saved as a two-page PDF, the same facts you have been walking through.':
    'Αποθηκεύτηκε ως PDF δύο σελίδων, με όσα περπάτησες.',
  'A two-page PDF, printed from everything on this island.':
    'Ένα PDF δύο σελίδων, τυπωμένο από όλα όσα υπάρχουν σε αυτό το νησί.',
  Read: 'Διάβασε',
  'The original': 'Το πρωτότυπο',
  'The original, page by page': 'Το πρωτότυπο, σελίδα σελίδα',
  'Open the signed letter': 'Άνοιξε την υπογεγραμμένη επιστολή',
  'Letter of reference from': 'Συστατική επιστολή από',
  'Click to read the letter.': 'Κάνε κλικ για να διαβάσεις την επιστολή.',
  'Click a name to read the letter.':
    'Κάνε κλικ σε ένα όνομα για να διαβάσεις την επιστολή.',
  'in total.': 'συνολικά.',

  /* ------------------------------ Journal ----------------------------- */
  'Field journal': 'Ημερολόγιο πεδίου',
  of: 'από',
  Keyring: 'Μπρελόκ',
  'What you have learned': 'Τι έμαθες',
  'Nothing yet. Talk to the townspeople and step into the buildings. Everything you learn is filed here.':
    'Τίποτα ακόμη. Μίλησε στους κατοίκους και μπες στα κτίρια. Ό,τι μαθαίνεις καταγράφεται εδώ.',
  'Not discovered yet': 'Δεν ανακαλύφθηκε ακόμη',
  'Island complete. You now know the whole CV. The Radio Center is waiting.':
    'Το νησί ολοκληρώθηκε. Ξέρεις πλέον όλο το βιογραφικό. Το Ραδιοφωνικό Κέντρο περιμένει.',
  'Taken.': 'Πάρθηκε.',

  /* -------------------------------- Map ------------------------------- */
  'Island map': 'Χάρτης του νησιού',
  keys: 'κλειδιά',
  'places found': 'μέρη βρέθηκαν',
  'Step outside first': 'Βγες πρώτα έξω',
  'Travel to': 'Ταξίδι προς',
  Missions: 'Αποστολές',
  'The Old Lighthouse': 'Ο Παλιός Φάρος',
  'Open. The keeper’s logbook is at the top.':
    'Ανοιχτός. Το ημερολόγιο του φαροφύλακα είναι στην κορυφή.',
  'Sealed with five locks.': 'Σφραγισμένος με πέντε κλειδαριές.',
  'turned.': 'γύρισαν.',
  'Step outside to travel.': 'Βγες έξω για να ταξιδέψεις.',
  'Click a place you have found to travel there.':
    'Κάνε κλικ σε ένα μέρος που βρήκες για να πας εκεί.',

  /* ---------------------------- Arcade board -------------------------- */
  'Games board · Town Plaza': 'Πίνακας παιχνιδιών · Κεντρική Πλατεία',
  'Island Games': 'Παιχνίδια του Νησιού',
  'Four in daylight, one after the lamps go out. Leave any of them with Esc.':
    'Τέσσερα με το φως της μέρας, ένα αφού σβήσουν τα φώτα. Βγες από οποιοδήποτε με Esc.',
  'Behind five locks. Find every district key first.':
    'Πίσω από πέντε κλειδαριές. Βρες πρώτα όλα τα κλειδιά των συνοικιών.',
  'After dark only. Press L.': 'Μόνο όταν νυχτώσει. Πάτα L.',
  'Daylight only. Press L.': 'Μόνο με το φως της μέρας. Πάτα L.',
  'After dark only.': 'Μόνο όταν νυχτώσει.',
  'Daylight only.': 'Μόνο με το φως της μέρας.',

  /* ------------------------------ Balloon ----------------------------- */
  'Balloon drop': 'Ρίψη από αερόστατο',
  'Out in the sun on the roads and the parade ground. A bomb drops like a stone, so it lands close to under you, and everyone it catches scatters, hands over their heads.':
    'Στον ήλιο, στους δρόμους και στο προαύλιο. Η βόμβα πέφτει σαν πέτρα, οπότε προσγειώνεται σχεδόν από κάτω σου, και όποιον πιάσει τον σκορπίζει με τα χέρια πάνω από το κεφάλι.',
  'Something to celebrate, at the doors and in the gardens. Confetti floats down, so it drifts a long way past the bomb, and everyone under it cheers.':
    'Κάτι να γιορτάσουν, στις πόρτες και στους κήπους. Το κομφετί κατεβαίνει αργά, οπότε παρασύρεται πολύ πιο πέρα από τη βόμβα, και όποιος βρεθεί από κάτω ζητωκραυγάζει.',
  'Two rings follow you across the grass: the blue one is where a bomb would land, the pink one where confetti would. Line the right ring up with the right gathering.':
    'Δύο δαχτυλίδια σε ακολουθούν στο χορτάρι: το μπλε δείχνει πού θα πέσει η βόμβα, το ροζ πού θα πέσει το κομφετί. Ευθυγράμμισε το σωστό δαχτυλίδι με τη σωστή παρέα.',
  'Drop the wrong thing on somebody and they stay on the list. Nothing is timed against you; the clock only counts the flight.':
    'Αν ρίξεις σε κάποιον το λάθος πράγμα, μένει στη λίστα. Τίποτα δεν μετράει εναντίον σου· το ρολόι μετράει μόνο την πτήση.',
  Drift: 'Πλεύση',
  Stick: 'Μοχλός',
  Climb: 'Άνοδος',
  'Hold UP': 'Κράτα UP',
  'Hold DOWN': 'Κράτα DOWN',
  Sink: 'Κάθοδος',
  '💧 button': 'Κουμπί 💧',
  '🎉 button': 'Κουμπί 🎉',
  'Lean into the drift': 'Γείρε προς την πλεύση',
  'Swing the basket': 'Στρίψε το καλάθι',
  'Burner: climb': 'Καυστήρας: άνοδος',
  'Vent: drop': 'Βαλβίδα: κάθοδος',
  'Hold Shift': 'Κράτα Shift',
  'Hold Ctrl': 'Κράτα Ctrl',
  'Come down': 'Προσγείωση',
  Served: 'Εξυπηρετήθηκαν',
  'Parcels dropped': 'Δέματα που έπεσαν',
  'On the mark': 'Στον στόχο',
  'Wrong parcel': 'Λάθος δέμα',
  'Time aloft': 'Χρόνος στον αέρα',
  'm up': 'μ. ύψος',
  'km/h': 'χλμ/ώρα',
  Burner: 'Καυστήρας',
  'Everyone served': 'Εξυπηρετήθηκαν όλοι',

  /* ---------------------------- Hide and seek ------------------------- */
  'Every lamp on the island goes out: the windows, the lighthouse, the searchlight over the camp. The only light left anywhere is whatever somebody is carrying.':
    'Κάθε λάμπα στο νησί σβήνει: τα παράθυρα, ο φάρος, ο προβολέας πάνω από το στρατόπεδο. Το μόνο φως που μένει είναι ό,τι κουβαλάει ο καθένας.',
  'walk up and touch them': 'πλησίασε και άγγιξέ τους',
  lit: 'αναμμένο',
  'They run when they see you': 'Το βάζουν στα πόδια μόλις σε δουν',
  'Anything you do draws them.': 'Ό,τι κι αν κάνεις τους τραβάει.',
  'Still and dark is safe': 'Ακίνητος και στο σκοτάδι είσαι ασφαλής',
  'Keep low': 'Χαμηλά',
  DUCK: 'ΣΚΥΨΕ',
  'Torch out': 'Σβήσε τη δάδα',
  'Give up': 'Παραίτηση',
  Found: 'Βρέθηκαν',
  'Held out': 'Άντεξες',
  'They are still counting. Get out of sight.': 'Ακόμη μετράνε. Κρύψου.',
  'Your torch is out. Press T or you will never see them at all':
    'Η δάδα σου είναι σβηστή. Πάτα T αλλιώς δεν πρόκειται να τους δεις',
  'seconds to hold out': 'δευτερόλεπτα να αντέξεις',

  /* ------------------------------- Moto ------------------------------- */
  'Island Circuit': 'Πίστα του Νησιού',
  Ride: 'Οδήγηση',
  Brake: 'Φρένο',
  'Pull the stick back': 'Τράβα τον μοχλό πίσω',
  'Hold WHEELIE': 'Κράτα WHEELIE',
  Gas: 'Γκάζι',
  Steer: 'Τιμόνι',
  'Hold Space': 'Κράτα Space',
  Retire: 'Εγκατάλειψη',
  'Stay on the tarmac. The grass will not hold a bike much above half speed, and the forest between the roads is thick.':
    'Μείνε στην άσφαλτο. Το χορτάρι δεν κρατάει μηχανή πολύ πάνω από τη μισή ταχύτητα, και το δάσος ανάμεσα στους δρόμους είναι πυκνό.',
  'Cutting the middle of the island does not shorten the lap. You have to come past every sector of the circuit for it to count.':
    'Το να κόψεις από τη μέση του νησιού δεν συντομεύει τον γύρο. Πρέπει να περάσεις από κάθε τομέα της πίστας για να μετρήσει.',
  'Sit right behind one of them and the tow pulls you along faster than the bike will go on its own. That is the way past on a road this narrow.':
    'Κόλλα πίσω από κάποιον και η ρουφήχτρα σε τραβάει πιο γρήγορα απ’ ό,τι πάει η μηχανή μόνη της. Έτσι προσπερνάς σε τόσο στενό δρόμο.',
  'A shoulder in the corners costs a little speed and no more. They will give you room if you are quicker.':
    'Ένα σπρώξιμο ώμο με ώμο στις στροφές κοστίζει λίγη ταχύτητα και τίποτε άλλο. Θα σου κάνουν χώρο αν είσαι γρηγορότερος.',
  Finished: 'Τερμάτισε',
  'Race time': 'Χρόνος αγώνα',
  'Best lap': 'Καλύτερος γύρος',
  'Hold it': 'Κράτα το',
  'of 4': 'από 4',
  'Off the circuit': 'Εκτός πίστας',
  Tow: 'Ρουφήχτρα',

  /* ----------------------------- Paintball ---------------------------- */
  Paintball: 'Πέιντμπολ',
  'The island splits in two for an afternoon, and the sides are never the same twice. Whoever picked up a marker for you is standing in the plaza; everyone else is out in the fields.':
    'Το νησί χωρίζεται στα δύο για ένα απόγευμα, και οι ομάδες δεν είναι ποτέ ίδιες. Όποιος πήρε όπλο με το μέρος σου στέκεται στην πλατεία· όλοι οι άλλοι είναι έξω στα χωράφια.',
  'Your marker leads whichever enemy you are facing. A ring marks them. Paint a friend and you lose them.':
    'Το όπλο σου σημαδεύει όποιον αντίπαλο κοιτάς. Ένα δαχτυλίδι τον δείχνει. Αν βάψεις δικό σου, τον χάνεις.',
  'Painted by you': 'Βαμμένοι από σένα',
  'Team total': 'Σύνολο ομάδας',
  'Lives left': 'Ζωές που μένουν',
  'Friendly fire': 'Φίλια πυρά',
  'Markers down until the whistle': 'Όπλα κάτω μέχρι τη σφυρίχτρα',
  Lives: 'Ζωές',
  Hopper: 'Γεμιστήρας',
  'Down. You cannot shoot from here':
    'Πεσμένος. Δεν μπορείς να πυροβολήσεις από εδώ',

  /* ------------------------------ Rescue ------------------------------ */
  'Sea rescue': 'Θαλάσσια διάσωση',
  Throttle: 'Γκάζι',
  Astern: 'Όπισθεν',
  Helm: 'Πηδάλιο',
  'Stick left and right': 'Μοχλός δεξιά και αριστερά',
  Chart: 'Χάρτης',
  'Put in': 'Πλεύρισε',
  'take the way off her': 'κόψε ταχύτητα',
  'The ring on the water round the boat goes green the moment she is slow enough, and the ring round the raft fills as they come over. Open the throttle and it empties again.':
    'Το δαχτυλίδι στο νερό γύρω από το σκάφος γίνεται πράσινο μόλις κόψει αρκετά, και το δαχτυλίδι γύρω από τη σχεδία γεμίζει καθώς ανεβαίνουν. Αν δώσεις γκάζι, αδειάζει ξανά.',
  'The panel lists every flare in the water, shortest first, and that order is the only real decision in the game. Let one burn out and the run is over.':
    'Ο πίνακας δείχνει κάθε φωτοβολίδα στο νερό, με τη συντομότερη πρώτη, και αυτή η σειρά είναι η μόνη πραγματική απόφαση του παιχνιδιού. Αν αφήσεις μία να σβήσει, τελείωσε.',
  'Taken aboard': 'Περισυνελέγησαν',
  'Time at sea': 'Χρόνος στη θάλασσα',
  'No flares in the water': 'Καμία φωτοβολίδα στο νερό',
  kn: 'κόμβοι',
  Aground: 'Προσάραξε',
  'Hold her': 'Κράτα την',
  'Too fast': 'Πολύ γρήγορα',

  /* ---------------------------- Radio console ------------------------- */
  'Channel 1 · Email': 'Κανάλι 1 · Email',
  Clipboard: 'Πρόχειρο',
  'Channel 2 · LinkedIn': 'Κανάλι 2 · LinkedIn',
  'Channel 3 · Message desk': 'Κανάλι 3 · Γραφείο μηνυμάτων',
  'This island has no backend. The desk hands your message to your own mail client, already addressed and written.':
    'Αυτό το νησί δεν έχει backend. Το γραφείο παραδίδει το μήνυμά σου στο δικό σου πρόγραμμα αλληλογραφίας, ήδη γραμμένο και με παραλήπτη.',
  'Your name': 'Το όνομά σου',
  'Your email': 'Το email σου',
  Subject: 'Θέμα',
  Message: 'Μήνυμα',
  '📡 Transmit': '📡 Εκπομπή',
  'Hi Kitsos, I found you on your island…':
    'Γεια σου Κίτσο, σε βρήκα στο νησί σου…',
  'Messages from this desk come straight to my inbox. Leave an address and I will write back.':
    'Τα μηνύματα από αυτό το γραφείο έρχονται κατευθείαν στα εισερχόμενά μου. Άφησε μια διεύθυνση και θα σου απαντήσω.',
  '📡 Transmitting…': '📡 Εκπέμπεται…',
  'Signal received. I will answer at the address you left.':
    'Το σήμα ελήφθη. Θα απαντήσω στη διεύθυνση που άφησες.',
  'That email address does not look right. I need it to reply.':
    'Αυτή η διεύθυνση email δεν φαίνεται σωστή. Τη χρειάζομαι για να απαντήσω.',
  'That name is too long for the desk.':
    'Το όνομα είναι πολύ μεγάλο για το γραφείο.',
  'The message is empty, or longer than the desk can carry.':
    'Το μήνυμα είναι άδειο ή μεγαλύτερο απ’ όσο χωράει το γραφείο.',
  'Pick one of the subjects on the list.':
    'Διάλεξε ένα από τα θέματα της λίστας.',
  'The check that you are a person did not pass. Try once more.':
    'Ο έλεγχος ότι είσαι άνθρωπος δεν πέρασε. Δοκίμασε ξανά.',
  'Too many messages in a minute. Wait a little and try again.':
    'Πάρα πολλά μηνύματα σε ένα λεπτό. Περίμενε λίγο και δοκίμασε ξανά.',
  'The transmitter is down. Your message is still here: send it from your own mail client instead.':
    'Ο πομπός είναι εκτός λειτουργίας. Το μήνυμά σου είναι ακόμα εδώ: στείλ’ το από το δικό σου πρόγραμμα αλληλογραφίας.',
  'Open it in my mail client': 'Άνοιξέ το στο πρόγραμμα αλληλογραφίας μου',

  /* --------------------------- Buttons and titles -------------------- */

  'Open the map': 'Άνοιξε τον χάρτη',
  'Open the map (M)': 'Άνοιξε τον χάρτη (M)',
  'Contact & full CV (G)': 'Επικοινωνία & πλήρες βιογραφικό (G)',
  'Zoom in (Z, = or the wheel)': 'Μεγέθυνση (Z, = ή η ρόδα)',
  'Zoom out (C, - or the wheel)': 'Σμίκρυνση (C, - ή η ρόδα)',
  'First person': 'Πρώτο πρόσωπο',
  Laps: 'Γύροι',
  Grade: 'Επίπεδο',

  /* ------------------------- On-screen controls ---------------------- */

  'Drop a water bomb': 'Ρίξε βόμβα νερού',
  'Throw confetti': 'Πέτα κομφετί',

  /* ---------------------------- Key legends -------------------------- */

  /*
   * What each control does, alongside the key that does it. The keys
   * themselves stay as they are printed — a Greek keyboard has the same W
   * and the same Shift on it, and the labels on the on-screen buttons are
   * the ones the legend has to match.
   */
  'out of his own eyes': 'μέσα από τα μάτια του',
  'zoom in and out': 'μεγέθυνση και σμίκρυνση',
  'W and S': 'W και S',
  'Q and E': 'Q και E',
  'Z and C, or the wheel': 'Z και C, ή η ρόδα',
  drift: 'πλεύση',
  climb: 'άνοδος',
  'climb and sink': 'άνοδος και κάθοδος',
  drop: 'ρίψη',
  turn: 'στροφή',
  burner: 'καυστήρας',
  vent: 'εκτόνωση',
  bomb: 'βόμβα',
  confetti: 'κομφετί',
  ride: 'οδήγηση',
  'hold it': 'κράτα το',
  'gas & brake': 'γκάζι & φρένο',
  steer: 'τιμόνι',
  wheelie: 'σούζα',
  map: 'χάρτης',
  shoot: 'βολή',
  'get down': 'σκύψε',
  walk: 'περπάτημα',
  'keep low': 'μείνε χαμηλά',
  torch: 'δάδα',
  'give up': 'εγκατάλειψη',
  helm: 'πηδάλιο',
  'pull back to stop alongside': 'τράβα πίσω για να σταματήσεις δίπλα',
  throttle: 'γκάζι',
  chart: 'χάρτης',
  'put in': 'επιστροφή',

  /* The lighthouse, once it turns out to be a ship. */
  Orbit: 'Τροχιά',
  'In orbit': 'Σε τροχιά',
  'You made it off the island': 'Έφυγες από το νησί',
  'The lighthouse was a gantry all along, and the summit room was the flight deck. Kitsos Island is the blue-green shape under the window now, with every road you walked on it.':
    'Ο φάρος ήταν ικρίωμα από την αρχή, και η αίθουσα της κορυφής ήταν το πιλοτήριο. Το Νησί του Κίτσου είναι τώρα το γαλαζοπράσινο σχήμα κάτω από το παράθυρο, με κάθε δρόμο που περπάτησες πάνω του.',
  'Put your name on it': 'Βάλε το όνομά σου',
  'your name here': 'το όνομά σου εδώ',
  'Take your certificate': 'Πάρε το πιστοποιητικό σου',
  'Saved — take another': 'Αποθηκεύτηκε — πάρε κι άλλο',
  'And the full CV': 'Και το πλήρες βιογραφικό',
  'Preview of your certificate': 'Προεπισκόπηση του πιστοποιητικού σου',
  'Credential ID': 'Αναγνωριστικό πιστοποιητικού',
  'Credential URL': 'Σύνδεσμος επαλήθευσης',
  'Add to your LinkedIn profile': 'Πρόσθεσέ το στο προφίλ σου στο LinkedIn',
  'Share the island on LinkedIn': 'Μοιράσου το νησί στο LinkedIn',
  'Signed by': 'Υπογραφή',
  'Thanks for walking the whole of it.':
    'Ευχαριστώ που το περπάτησες ολόκληρο.',
  'Fly back down to the island': 'Πέτα πίσω στο νησί',
  'Certificate saved. The shirt comes with the landing.':
    'Το πιστοποιητικό αποθηκεύτηκε. Η μπλούζα έρχεται με την προσγείωση.',
  'You can take the certificate down with you either way.':
    'Μπορείς να πάρεις το πιστοποιητικό μαζί σου ούτως ή άλλως.',
  'to launch': 'για εκτόξευση',
  'Hold. Strapped in and counting.': 'Αναμονή. Δεμένος και μετράει αντίστροφα.',
  'Ignition. The gantry has let go.': 'Ανάφλεξη. Το ικρίωμα άφησε.',
  'Climbing. The island is getting smaller.': 'Ανέρχεται. Το νησί μικραίνει.',
  'Orbit. Nothing out here but the hum.':
    'Τροχιά. Τίποτα εδώ έξω πέρα από το βουητό.',
  LAUNCH: 'ΕΚΤΟΞΕΥΣΗ',
  'SUIT UP FIRST': 'ΦΟΡΕΣΕ ΣΤΟΛΗ ΠΡΩΤΑ',
  'ASTRO SUIT': 'ΑΣΤΡΟΣΤΟΛΗ',
  'SUIT ON': 'ΣΤΟΛΗ ΦΟΡΕΜΕΝΗ',
  'KITSOS ISLAND · DEPARTURE': 'ΝΗΣΙ ΚΙΤΣΟΥ · ΑΝΑΧΩΡΗΣΗ',
  Credits: 'Συντελεστές',
  'Special thanks': 'Ιδιαίτερες ευχαριστίες',
  'To the love of my life, Amalia.': 'Στον έρωτα της ζωής μου, την Αμαλία.',
  'And to you, for walking the whole of it.':
    'Και σε σένα, που το περπάτησες ολόκληρο.',
  'Played By': 'Παίχτηκε από',
  'Hang on...': 'Μια στιγμή...',
  'THIS IS NOT A LIGHTHOUSE': 'ΑΥΤΟ ΔΕΝ ΕΙΝΑΙ ΦΑΡΟΣ',
  'IT IS A SPACE ROCKET': 'ΕΙΝΑΙ ΔΙΑΣΤΗΜΙΚΟΣ ΠΥΡΑΥΛΟΣ',
  Cast: 'Διανομή',
  Engineering: 'Μηχανική',
  'Art department': 'Καλλιτεχνικό τμήμα',
  Production: 'Παραγωγή',
  'Special effects': 'Ειδικά εφέ',
  Catering: 'Τροφοδοσία',
  'Written and built by': 'Γράφτηκε και χτίστηκε από',
  'To my family, for all of it.': 'Στην οικογένειά μου, για όλα.',
  'Thanks for walking the island.': 'Ευχαριστώ που περπάτησες το νησί.',
  'DEPARTURE IN PROGRESS': 'ΑΝΑΧΩΡΗΣΗ ΣΕ ΕΞΕΛΙΞΗ',
  'THE OLD LIGHTHOUSE - CUTAWAY': 'Ο ΠΑΛΙΟΣ ΦΑΡΟΣ - ΤΟΜΗ',
  Shirt: 'Μπλούζα',
  Star: 'Αστέρι',
  Original: 'Αρχική',
  'MEET THE CHARACTERS': 'ΓΝΩΡΙΣΤΕ ΤΟΥΣ ΧΑΡΑΚΤΗΡΕΣ',
  Met: 'Γνώρισες',
  'of the': 'από τους',
  'with a story to tell.': 'που έχουν μια ιστορία να πουν.',
  'Out on the island': 'Έξω στο νησί',
  'At the thesis defence': 'Στην παρουσίαση της διπλωματικής',
  'Around the island': 'Σε όλο το νησί',
  'After dark': 'Μετά το σούρουπο',
  'Christmas Day only': 'Μόνο ανήμερα τα Χριστούγεννα',
}
