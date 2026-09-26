/**
 * Greek for the CV: the panels behind every exhibit on the island, the four
 * letters of reference, the bookshelves, and the keeper's logbook at the top of
 * the lighthouse.
 *
 * The letters are formal documents and are rendered in the register a Greek
 * reader expects of one — two of them were written in Greek in the first place
 * and are translated into English in the source, so these put them back.
 */

/**
 * Technology, product and company names, kept in Latin exactly as the industry
 * writes them. A Greek engineer reads "Spring Boot", not a transliteration, and
 * a recruiter searching the page expects to find the Latin string. They are
 * listed rather than omitted so the translation coverage check can tell a
 * deliberate pass-through from a gap.
 */
const KEPT = [
  'Java',
  'Spring Boot',
  'Spring AI',
  'Ollama',
  'Vitest',
  'Spring Framework',
  'Spring Security',
  'Spring Data JPA',
  'React',
  'MySQL',
  'Docker',
  'Docker Compose',
  'Hibernate',
  'Microservices',
  'REST APIs',
  'Agentic AI',
  'Jenkins',
  'Podman',
  'ELK Stack',
  'Grafana',
  'Jira',
  'Microsoft Teams',
  'Twilio',
  'React Native',
  'Confluence',
  'GitLab CI',
  'Bitbucket Pipelines',
  'SMART on FHIR',
  'Epic EHR',
  'SAML 2.0 SSO',
  'Microsoft ADFS',
  'HIPAA',
  'reCAPTCHA',
  'AWS (EC2, S3, SES, SNS)',
  'IBM',
  'IBM Consulting',
  'CITI Program',
  'MIT Open Learning',
  'University of Michigan',
  'arXiv, Cornell University',
  'Java · Spring Boot · React · AWS',
]

const AS_WRITTEN: Record<string, string> = Object.fromEntries(
  KEPT.map((term) => [term, term]),
)

export const PROFILE: Record<string, string> = {
  ...AS_WRITTEN,

  /* ---------------------------- Trainer card -------------------------- */
  'Senior Software Engineer & Technical Lead':
    'Senior Software Engineer & Technical Lead',
  'Trainer card': 'Κάρτα εκπαιδευτή',
  'Senior Software Engineer and Technical Lead based in Athens, Greece. I build cloud-native healthcare products end to end, Java and Spring Boot on the backend, React on the front, AWS underneath, and I lead the teams that ship them into hospitals.':
    'Senior Software Engineer και Technical Lead με έδρα την Αθήνα. Φτιάχνω cloud-native προϊόντα υγείας από άκρη σε άκρη, Java και Spring Boot στο backend, React μπροστά, AWS από κάτω, και ηγούμαι των ομάδων που τα βγάζουν στα νοσοκομεία.',
  'Athens, Greece': 'Αθήνα, Ελλάδα',
  Nationality: 'Υπηκοότητα',
  Greek: 'Ελληνική',
  Field: 'Τομέας',
  'Full stack / cloud / health tech': 'Full stack / cloud / τεχνολογία υγείας',
  Currently: 'Αυτή τη στιγμή',
  'Senior Software Engineer': 'Senior Software Engineer',
  Languages: 'Γλώσσες',
  'Off the clock': 'Εκτός ωραρίου',
  'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro, and a blood donor since 2017.':
    'Επικεφαλής εθελοντής στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» στο Παλαιό Φάληρο, και αιμοδότης από το 2017.',
  'Greek, native speaker': 'Ελληνικά, μητρική γλώσσα',
  'English, proficiency (ECPE, University of Michigan, 2016)':
    'Αγγλικά, proficiency (ECPE, University of Michigan, 2016)',
  'French, B2 (DELF, 2019)': 'Γαλλικά, B2 (DELF, 2019)',
  Cycling: 'Ποδήλατο',
  Theater: 'Θέατρο',
  'DIY & handiwork': 'Μαστορέματα & κατασκευές',
  Chess: 'Σκάκι',
  Hiking: 'Πεζοπορία',
  Camping: 'Κάμπινγκ',

  /* ------------------------------ Education --------------------------- */
  'Higher education': 'Ανώτατη εκπαίδευση',
  'MEng, Electrical & Computer Engineering':
    'Δίπλωμα Ηλεκτρολόγου Μηχανικού & Μηχανικού Υπολογιστών',
  'National Technical University of Athens (NTUA)':
    'Εθνικό Μετσόβιο Πολυτεχνείο (ΕΜΠ)',
  '2017 – 2022 · GPA 8.4': '2017 – 2022 · βαθμός 8,4',
  'Seminars & workshops': 'Σεμινάρια & εργαστήρια',
  'Thesis: compliance analysis of movement exercises using machine learning, supervised by Prof. Panagiotis Tsanakas, Dean of the School, graded with distinction, and later published on arXiv.':
    'Διπλωματική: ανάλυση συμμόρφωσης ασκήσεων κίνησης με μηχανική μάθηση, με επιβλέποντα τον καθηγητή Παναγιώτη Τσανάκα, Κοσμήτορα της Σχολής, βαθμολογήθηκε με άριστα, και αργότερα δημοσιεύτηκε στο arXiv.',
  'Coursework with the Dean included Operating Systems and Software Service Technologies.':
    'Στα μαθήματα με τον Κοσμήτορα περιλαμβάνονταν τα Λειτουργικά Συστήματα και οι Τεχνολογίες Υπηρεσιών Λογισμικού.',
  'IBM graduate program (2024)': 'Πρόγραμμα αποφοίτων IBM (2024)',
  'Agile & Enterprise Design Thinking bootcamp, Hamburg (2024)':
    'Bootcamp Agile & Enterprise Design Thinking, Αμβούργο (2024)',
  'Arduino IEEE Workshop at NTUA (2018)':
    'Εργαστήριο Arduino IEEE στο ΕΜΠ (2018)',
  'Model High School of Ionidios, Piraeus':
    'Ιωνίδειος Πρότυπο Λύκειο, Πειραιάς',
  '2015 – 2017 · GPA 19.9 / 20': '2015 – 2017 · βαθμός 19,9 / 20',
  'Ranked 1st in the entrance exam to the oldest school in Piraeus, founded in 1847, and one of the four public Model schools in Greece.':
    '1ος στις εισαγωγικές εξετάσεις για το παλαιότερο σχολείο του Πειραιά, από το 1847, και ένα από τα τέσσερα δημόσια Πρότυπα σχολεία της Ελλάδας.',
  'Excellence award every year, and the Piraeus prize for the top graduating grade of 2017.':
    'Αριστείο κάθε χρόνο, και το βραβείο του Πειραιά για το πρώτο απολυτήριο του 2017.',
  '2nd among about 1,650 entrants in the Panhellenic Biology Competition (2016); awards in Mathematics and Programming; captain of the school’s EUSO science team.':
    '2ος σε περίπου 1.650 συμμετέχοντες στον Πανελλήνιο Διαγωνισμό Βιολογίας (2016)· βραβεία σε Μαθηματικά και Προγραμματισμό· αρχηγός της ομάδας EUSO του σχολείου.',
  'Summer School of the University of Piraeus; self-taught C++ from the age of sixteen.':
    'Θερινό Σχολείο του Πανεπιστημίου Πειραιώς· αυτοδίδακτος στη C++ από τα δεκαέξι.',

  /* ------------------------------ Ionidios ---------------------------- */
  'The oldest school in Piraeus, founded in 1847, and one of the four public Model schools in Greece. Evangeliki, which he had just left, is another. Another entrance exam, and he ranked 1st in it again.':
    'Το παλαιότερο σχολείο του Πειραιά, από το 1847, και ένα από τα τέσσερα δημόσια Πρότυπα σχολεία της Ελλάδας. Η Ευαγγελική, από την οποία μόλις είχε φύγει, είναι ένα ακόμη. Άλλες μία εισαγωγικές εξετάσεις, και βγήκε ξανά 1ος.',
  'Graduating grade': 'Βαθμός απολυτηρίου',
  'Excellence award': 'Αριστείο',
  Honours: 'Διακρίσεις',
  'The excellence award in every year.': 'Το αριστείο κάθε χρόνο.',
  'The Piraeus prize for the top graduating grade of the year, on leaving in 2017 with 19.9 out of 20.':
    'Το βραβείο του Πειραιά για το πρώτο απολυτήριο της χρονιάς, αποφοιτώντας το 2017 με 19,9 στα 20.',
  'First in performance in his class, year after year. His biology teacher put it in writing.':
    'Πρώτος σε επίδοση στο τμήμα του, χρόνο με τον χρόνο. Η καθηγήτριά του στη Βιολογία το έβαλε γραπτώς.',
  'Contests and the bench': 'Διαγωνισμοί και ο πάγκος',
  '2nd among about 1,650 entrants in the Panhellenic Biology Competition, 2016.':
    '2ος σε περίπου 1.650 συμμετέχοντες στον Πανελλήνιο Διαγωνισμό Βιολογίας, 2016.',
  'Notable awards in Mathematics and Programming.':
    'Αξιοσημείωτα βραβεία σε Μαθηματικά και Προγραμματισμό.',
  'Captain of the school’s EUSO team, the European Union Science Olympiad, where three students share one bench of experiments.':
    'Αρχηγός της ομάδας EUSO του σχολείου, της Ολυμπιάδας Φυσικών Επιστημών της Ευρωπαϊκής Ένωσης, όπου τρεις μαθητές μοιράζονται έναν πάγκο πειραμάτων.',
  'Summer School of the University of Piraeus, on his informatics teacher’s recommendation, and C++ on his own from the age of sixteen.':
    'Θερινό Σχολείο του Πανεπιστημίου Πειραιώς, με σύσταση του καθηγητή Πληροφορικής του, και C++ μόνος του από τα δεκαέξι.',

  /* --------------------------- Ionidios letters ----------------------- */
  'Dr Dimitra Pantou': 'Δρ Δήμητρα Πάντου',
  'Biologist, PhD, MSc · Model General Lyceum of the Ionidios School of Piraeus':
    'Βιολόγος, PhD, MSc · Πρότυπο Γενικό Λύκειο της Ιωνιδείου Σχολής Πειραιά',
  'Biology teacher for both lyceum years · Scholarship recommendation · 29 September 2017 · translated from Greek':
    'Καθηγήτρια Βιολογίας και τις δύο χρονιές του Λυκείου · Συστατική επιστολή για υποτροφία · 29 Σεπτεμβρίου 2017 · πρωτότυπο κείμενο',
  'Christos Orfanopoulos was my student at the Model General Lyceum of the Ionidios School of Piraeus for two school years (2015–2016 and 2016–2017). He attended the courses "General Biology, 2nd year of Lyceum", "General Biology, 3rd year of Lyceum" and "Biology, Science stream, 3rd year of Lyceum" with me as his teacher.':
    'Ο Ορφανόπουλος Χρήστος υπήρξε μαθητής μου στο Πρότυπο Γενικό Λύκειο της Ιωνιδείου Σχολής Πειραιά για δύο σχολικά έτη (2015-2016 και 2016-2017). Παρακολούθησε τα μαθήματα «Βιολογία Γεν. Παιδείας Β΄ Λυκείου», «Βιολογία Γεν. Παιδείας Γ΄ Λυκείου» και «Βιολογία Θετικής Κατεύθυνσης Γ΄ Λυκείου» με διδάσκουσα εμένα.',
  'Christos Orfanopoulos was an excellent student. In all three years of Lyceum he was consistently first in performance in his class. He is able to grasp new concepts quickly and to apply that knowledge in practice, which I concluded through the Biology laboratory lessons. He is intelligent, cooperative, and works hard and methodically to achieve his goals.':
    'Ο Ορφανόπουλος Χρήστος ήταν ένας άριστος μαθητής. Και στις τρεις τάξεις του Λυκείου ήταν σταθερά ο πρώτος σε επίδοση στο τμήμα του (απουσιολόγος). Είναι ικανός να συλλαμβάνει γρήγορα νέες έννοιες και να εφαρμόζει τη γνώση αυτή στην πρακτική, γεγονός το οποίο συμπέρανα μέσα από τα εργαστηριακά μαθήματα Βιολογίας. Είναι ευφυής, συνεργάσιμος και εργάζεται σκληρά και μεθοδικά ώστε να πετύχει τους στόχους του.',
  'Christos Orfanopoulos is a particularly interesting personality, with rare qualities and a bright character. He is an honest person, with faith in his abilities, consistency in his relationships with others and a strongly creative disposition. He is characterised by positive thinking, emotional maturity and adaptability, and he is extremely well liked among the people he keeps company with. He is without doubt among the best students I have had in recent years.':
    'Ο Ορφανόπουλος Χρήστος είναι μία ιδιαίτερα ενδιαφέρουσα προσωπικότητα με σπάνια χαρακτηριστικά και λαμπρό ήθος. Είναι άτομο ειλικρινές, με πίστη στις δυνατότητές του, συνέπεια στις σχέσεις του με τους άλλους και έντονα δημιουργική διάθεση. Χαρακτηρίζεται από θετική σκέψη, συναισθηματική ωριμότητα, προσαρμοστικότητα, ενώ είναι εξαιρετικά αγαπητός μεταξύ των ατόμων με τα οποία συναναστρέφεται. Είναι αναμφίβολα από τους καλύτερους μαθητές που είχα τα τελευταία χρόνια.',
  'Christos Orfanopoulos, as I mentioned, has analytical judgement and constantly sets himself clear goals, which he works hard to achieve. He is also an excellent computer user. I am certain that all these qualities will help him develop into an excellent student and a future scientist, on the one condition that he can devote himself to his school without the anxiety of covering his student expenses. I therefore recommend Christos Orfanopoulos unreservedly for the scholarship.':
    'Ο Ορφανόπουλος Χρήστος, όπως προανέφερα, έχει ικανότητα αναλυτικής κρίσης και θέτει διαρκώς σαφείς στόχους τους οποίους εργάζεται σκληρά για να τους πετύχει. Παράλληλα είναι εξαιρετικός χρήστης των Η/Υ. Είμαι σίγουρη πως όλα αυτά τα χαρακτηριστικά θα τον βοηθήσουν να εξελιχθεί σε άριστο φοιτητή και μελλοντικό επιστήμονα, με βασική προϋπόθεση ότι θα αφοσιωθεί στη σχολή του χωρίς να τον απασχολεί το άγχος για την κάλυψη των φοιτητικών του εξόδων. Γι’ αυτό λοιπόν συνιστώ ανεπιφύλακτα τον Ορφανόπουλο Χρήστο για την υποτροφία.',
  'Christos Orfanopoulos took second (2nd) place among approximately 1,650 participants in the Panhellenic Biology Competition (www.pdbio.gr) in the 2nd year of Lyceum, in 2016.':
    'Ο Ορφανόπουλος Χρήστος κατέλαβε τη δεύτερη (2η) θέση μεταξύ 1650 περίπου συμμετεχόντων στον Πανελλήνιο Διαγωνισμό Βιολογίας (www.pdbio.gr) στη Β΄ Λυκείου το 2016.',
  'Athina Mitsopoulou': 'Αθηνά Μητσοπούλου',
  'Chemist, MSc, PhD candidate · Lyceum of the Ionidios School of Piraeus':
    'Χημικός, MSc, υποψήφια διδάκτωρ · Λύκειο Ιωνιδείου Σχολής Πειραιά',
  'Chemistry teacher for both lyceum years · Scholarship recommendation · 28 September 2017 · translated from Greek':
    'Καθηγήτρια Χημείας και τις δύο χρονιές του Λυκείου · Συστατική επιστολή για υποτροφία · 28 Σεπτεμβρίου 2017 · πρωτότυπο κείμενο',
  'The candidate, Mr Christos Orfanopoulos, was my student in Chemistry for the last two years at the Model Lyceum of the Ionidios School of Piraeus.':
    'Ο υποψήφιος κ. Ορφανόπουλος Χρήστος υπήρξε μαθητής μου στο μάθημα της Χημείας τα δύο τελευταία χρόνια στο Πρότυπο Λύκειο της Ιωνιδείου Σχολής Πειραιά.',
  'Throughout those years he achieved outstanding results in my subject, showed an excellent grasp of new material, and confirmed his title of excellence.':
    'Όλα αυτά τα χρόνια σημείωσε εξαιρετικές επιδόσεις στο μάθημά μου, επέδειξε άριστη αντιληπτική ικανότητα και επιβεβαίωσε τον τίτλο της αριστείας.',
  'Besides his excellent performance in his lessons, the candidate also showed an outstanding character. He was always cooperative, willing to help, polite, disciplined, and friendly with his classmates.':
    'Εκτός από την άριστη επίδοσή του στα μαθήματα, ο συγκεκριμένος υποψήφιος επέδειξε και εξαιρετικό ήθος. Ήταν πάντα συνεργάσιμος, πρόθυμος να βοηθήσει, ευγενικός, πειθαρχημένος, φιλικός με τους συμμαθητές του.',
  'For this particular person, I am sure, studies will not only be the means of enriching his knowledge; they will be the springboard for his usefulness to society and his contribution to research and to science in general.':
    'Οι σπουδές για το συγκεκριμένο άτομο, είμαι σίγουρη ότι δεν αποτελούν μόνο το μέσο για τον εμπλουτισμό των γνώσεών του αλλά θα αποτελέσουν και το εφαλτήριο για την κοινωνική χρησιμότητά του, την προσφορά του στην έρευνα και την επιστήμη γενικότερα.',
  'The candidate took part in a great many of our school’s programmes, activities and events. He was my student in the "Physics and Chemistry" Club, where he showed particular ability in handling instruments and laboratory equipment, in taking accurate measurements and in processing the results correctly. He showed initiative and consistency, qualities a future scientist cannot do without.':
    'Ο υποψήφιος συμμετείχε σε πληθώρα Προγραμμάτων, δράσεων και εκδηλώσεων του Σχολείου μας. Υπήρξε μαθητής μου στον Όμιλο «Φυσικοχημείας» όπου επέδειξε ιδιαίτερες ικανότητες στο χειρισμό των οργάνων και του εργαστηριακού εξοπλισμού, στη λήψη ακριβών μετρήσεων και στη σωστή επεξεργασία των αποτελεσμάτων. Ανέπτυξε πρωτοβουλία και συνέπεια, χαρακτηριστικά απαραίτητα για έναν μελλοντικό επιστήμονα.',
  'Nikolaos Papadakis': 'Νικόλαος Παπαδάκης',
  'Physics teacher · Model General Lyceum of the Ionidios School of Piraeus':
    'Καθηγητής Φυσικής · Πρότυπο Γενικό Λύκειο Ιωνιδείου Σχολής Πειραιά',
  'Physics teacher for both lyceum years · Scholarship recommendation · 27 September 2017 · translated from Greek':
    'Καθηγητής Φυσικής και τις δύο χρονιές του Λυκείου · Συστατική επιστολή για υποτροφία · 27 Σεπτεμβρίου 2017 · πρωτότυπο κείμενο',
  'I was the candidate’s teacher in general Physics and science-stream Physics in the 2nd and 3rd years of Lyceum.':
    'Ήμουν καθηγητής του υποψηφίου στη Φυσική Γενικής Παιδείας και Κατεύθυνσης στη Β΄ και Γ΄ τάξη του Λυκείου.',
  'His performance was excellent throughout the two years I had him as a student.':
    'Η επίδοσή του ήταν άριστη σε όλη τη διάρκεια των 2 ετών που τον είχα μαθητή.',
  'Very hard-working, with an excellent character. He also took part in every event, competition and presentation our school put on, and did so with particular effectiveness.':
    'Πολύ εργατικός με εξαιρετικό ήθος. Συμμετείχε επίσης σε όλες τις εκδηλώσεις, διαγωνισμούς και παρουσιάσεις που έγιναν από το σχολείο μας με ιδιαίτερη αποτελεσματικότητα.',
  'His interest in the physical sciences, and in their practical applications too, is such that his studies will give him a deep understanding of every subject that concerns him.':
    'Το ενδιαφέρον του για τις φυσικές επιστήμες αλλά και τις πρακτικές εφαρμογές τους είναι τέτοιο ώστε η φοίτησή του θα του εξασφαλίσει την εμβάθυνση σε όλα τα θέματα που τον αφορούν.',
  'I would describe him as very hard-working, a pleasant personality with a particular sense of humour, and a very good conversationalist with clear arguments.':
    'Θα τον χαρακτήριζα πολύ εργατικό, ευχάριστη προσωπικότητα με ιδιαίτερο χιούμορ, πολύ καλό συνομιλητή με ξεκάθαρα επιχειρήματα.',
  'Model Junior High School of Evangeliki, Nea Smyrni':
    'Πρότυπο Γυμνάσιο Ευαγγελικής Σχολής, Νέα Σμύρνη',
  'Ranked 1st in the entrance exam to one of only four public Model schools in Greece.':
    '1ος στις εισαγωγικές εξετάσεις σε ένα από τα μόλις τέσσερα δημόσια Πρότυπα σχολεία της Ελλάδας.',
  'First of the class every year, with the prize of excellence; class president and representative of the school.':
    'Πρώτος της τάξης κάθε χρόνο, με το αριστείο· πρόεδρος της τάξης και εκπρόσωπος του σχολείου.',
  'After-school programming in Pascal, astronomy and robotics; captain of the chess team.':
    'Απογευματινά μαθήματα προγραμματισμού σε Pascal, αστρονομίας και ρομποτικής· αρχηγός της ομάδας σκακιού.',
  'Placings in mathematics, programming and literature contests.':
    'Διακρίσεις σε διαγωνισμούς μαθηματικών, προγραμματισμού και λογοτεχνίας.',
  'Elementary school': 'Δημοτικό',
  'Chess and basketball captain': 'Αρχηγός σκακιού και μπάσκετ',
  '1st place in the city chess tournament; 3rd in the local basketball tournament.':
    '1η θέση στο τουρνουά σκακιού της πόλης· 3η στο τοπικό τουρνουά μπάσκετ.',

  /* ---------------------------- Town School --------------------------- */
  'A charismatic child with a good heart, always doing his homework and always participating. He will have a bright future. (Ms. Maria, his first teacher)':
    'Ένα χαρισματικό παιδί με καλή καρδιά, που κάνει πάντα τα μαθήματά του και συμμετέχει πάντα. Θα έχει λαμπρό μέλλον. (Κυρία Μαρία, η πρώτη του δασκάλα)',
  'Captain of the school chess team, 1st place in the city tournament.':
    'Αρχηγός της σχολικής ομάδας σκακιού, 1η θέση στο τουρνουά της πόλης.',
  'Captain of the school basketball team for two years, 3rd in the local tournament.':
    'Αρχηγός της σχολικής ομάδας μπάσκετ για δύο χρόνια, 3η θέση στο τοπικό τουρνουά.',
  'A historic school, founded in 1733, and one of only four public Model schools in the whole of Greece: you sit an entrance exam to get in. He ranked 1st.':
    'Ιστορικό σχολείο, με ρίζες στο 1733, και ένα από τα μόλις τέσσερα δημόσια Πρότυπα σχολεία σε όλη την Ελλάδα: μπαίνεις με εισαγωγικές εξετάσεις. Βγήκε 1ος.',
  Founded: 'Ίδρυση',
  'Public Model schools in Greece': 'Δημόσια Πρότυπα σχολεία στην Ελλάδα',
  'Entrance exam': 'Εισαγωγικές εξετάσεις',
  'Prize of excellence': 'Αριστείο',
  'Every year': 'Κάθε χρόνο',
  'First of the class': 'Πρώτος της τάξης',
  'First student of the class in every year, taking the prize of excellence each time.':
    'Πρώτος μαθητής της τάξης κάθε χρονιά, παίρνοντας κάθε φορά το αριστείο.',
  'Class president for a year, and representative of the school.':
    'Πρόεδρος της τάξης για έναν χρόνο, και εκπρόσωπος του σχολείου.',
  'Closed the presidency with a fifteen-page report to the principal on what the class had achieved, and returned every unspent cent of the class funds, as the law required and nobody expected.':
    'Έκλεισε την προεδρία με έναν απολογισμό δεκαπέντε σελίδων προς τον διευθυντή για όσα είχε πετύχει η τάξη, και επέστρεψε κάθε αδιάθετο ευρώ από το ταμείο της τάξης, όπως όριζε ο νόμος και δεν περίμενε κανείς.',
  Contests: 'Διαγωνισμοί',
  'Notable placings in Mathematics and Programming competitions.':
    'Αξιοσημείωτες θέσεις σε διαγωνισμούς Μαθηματικών και Προγραμματισμού.',
  '2nd prize in two school literature contests.':
    '2ο βραβείο σε δύο σχολικούς διαγωνισμούς λογοτεχνίας.',
  '7th prize in an open literature contest, the only entrant under eighteen to place.':
    '7ο βραβείο σε ανοιχτό διαγωνισμό λογοτεχνίας, ο μόνος ανήλικος που βραβεύτηκε.',
  'The extra classes': 'Τα επιπλέον μαθήματα',
  'A Model school keeps going after the timetable ends. He took four of the extra classes, and the habit never left him.':
    'Ένα Πρότυπο σχολείο συνεχίζει και μετά το πρόγραμμα. Παρακολούθησε τέσσερα από τα επιπλέον μαθήματα, και η συνήθεια δεν τον άφησε ποτέ.',
  'Programming, in Pascal': 'Προγραμματισμός, σε Pascal',
  'From the age of 13': 'Από τα 13',
  'Every extra exercise set, and then small games of his own, with graphics.':
    'Κάθε έξτρα άσκηση, και μετά μικρά παιχνίδια δικά του, με γραφικά.',
  Astronomy: 'Αστρονομία',
  'After-school class': 'Απογευματινό μάθημα',
  'Built a sundial and a small planetarium, both to correct scale.':
    'Έφτιαξε ένα ηλιακό ρολόι και ένα μικρό πλανητάριο, και τα δύο σε σωστή κλίμακα.',
  Robotics: 'Ρομποτική',
  'The class built a submarine drone.': 'Η τάξη έφτιαξε ένα υποβρύχιο drone.',
  'On his own: a proof-of-concept electric bicycle running on 12 V.':
    'Μόνος του: ένα πρωτότυπο ηλεκτρικού ποδηλάτου που δούλευε στα 12 V.',
  'Chess team': 'Ομάδα σκακιού',
  Captain: 'Αρχηγός',
  'Led the school team, as he had in elementary school.':
    'Ηγήθηκε της σχολικής ομάδας, όπως και στο δημοτικό.',

  /* ----------------------------- Publication -------------------------- */
  'An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time':
    'An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time',
  '11 December 2025': '11 Δεκεμβρίου 2025',
  'Applicable to remote physiotherapy supervision: the patient’s own phone does the assessment, so nothing leaves the device.':
    'Εφαρμόσιμο σε απομακρυσμένη επίβλεψη φυσικοθεραπείας: την αξιολόγηση την κάνει το ίδιο το κινητό του ασθενούς, οπότε τίποτα δεν φεύγει από τη συσκευή.',
  'Diploma thesis, 2022': 'Διπλωματική εργασία, 2022',
  'Compliance analysis of movement exercises using machine learning: a system that watches how a movement is performed and judges it against how it should be performed. Supervised by Prof. Panagiotis Tsanakas, Dean of the School of ECE, who called it "marked by scientific soundness and technological originality" and graded it with distinction. Three years later it became a published paper.':
    'Ανάλυση συμμόρφωσης ασκήσεων κίνησης με μηχανική μάθηση: ένα σύστημα που παρακολουθεί πώς εκτελείται μια κίνηση και την κρίνει απέναντι στο πώς θα έπρεπε να εκτελεστεί. Με επιβλέποντα τον καθηγητή Παναγιώτη Τσανάκα, Κοσμήτορα της Σχολής ΗΜΜΥ, ο οποίος την χαρακτήρισε «άρτια επιστημονικά και τεχνολογικά πρωτότυπη» και τη βαθμολόγησε με άριστα. Τρία χρόνια αργότερα έγινε δημοσιευμένη εργασία.',
  'Grew out of the NTUA thesis: judging how a physiotherapy movement is actually performed against how it should be.':
    'Προέκυψε από τη διπλωματική στο ΕΜΠ: να κρίνεις πώς εκτελείται στην πράξη μια κίνηση φυσικοθεραπείας απέναντι στο πώς θα έπρεπε.',
  'Reads a movement as a sequence of static poses, estimated from a phone camera by a pose-estimation neural network.':
    'Διαβάζει μια κίνηση ως ακολουθία στατικών στάσεων, που εκτιμώνται από την κάμερα του κινητού με νευρωνικό δίκτυο εκτίμησης στάσης.',
  'Turns body keypoints into trigonometric angle features and classifies them with lightweight supervised models, giving per-frame pose predictions and accuracy scores.':
    'Μετατρέπει τα σημεία-κλειδιά του σώματος σε τριγωνομετρικά χαρακτηριστικά γωνιών και τα ταξινομεί με ελαφριά επιβλεπόμενα μοντέλα, δίνοντας προβλέψεις στάσης και βαθμούς ακρίβειας ανά καρέ.',
  'Recognises whole exercises and locates the inaccuracies using dynamic programming over a modified Levenshtein distance.':
    'Αναγνωρίζει ολόκληρες ασκήσεις και εντοπίζει τις ανακρίβειες με δυναμικό προγραμματισμό πάνω σε τροποποιημένη απόσταση Levenshtein.',
  'Runs entirely client-side, which is what keeps it scalable and real time.':
    'Τρέχει εξ ολοκλήρου στην πλευρά του client, και αυτό είναι που το κρατάει κλιμακώσιμο και σε πραγματικό χρόνο.',
  'Pose estimation': 'Εκτίμηση στάσης σώματος',
  'Machine learning': 'Μηχανική μάθηση',
  'Dynamic programming': 'Δυναμικός προγραμματισμός',
  'Levenshtein distance': 'Απόσταση Levenshtein',
  'm-Health': 'm-Health',
  'Machine learning over motion data rather than hand-written rules':
    'Μηχανική μάθηση πάνω σε δεδομένα κίνησης αντί για χειρόγραφους κανόνες',
  'The engineering lesson that stuck: a model is only as good as the pipeline feeding it':
    'Το μάθημα μηχανικής που έμεινε: ένα μοντέλο αξίζει όσο το pipeline που το τροφοδοτεί',
  'First real taste of shipping something a non-engineer has to trust':
    'Η πρώτη πραγματική γεύση του να βγάζεις κάτι που πρέπει να το εμπιστευτεί κάποιος που δεν είναι μηχανικός',

  /* --------------------------- Contests & certs ----------------------- */
  'Contests & awards': 'Διαγωνισμοί & διακρίσεις',
  'National Biology Competition 2016, ranked 2nd':
    'Πανελλήνιος Διαγωνισμός Βιολογίας 2016, 2η θέση',
  'Awards in Physics, Mathematics, Informatics and Literature contests':
    'Διακρίσεις σε διαγωνισμούς Φυσικής, Μαθηματικών, Πληροφορικής και Λογοτεχνίας',
  'AI, research & engineering': 'Τεχνητή νοημοσύνη, έρευνα & μηχανική',
  'Universal AI Foundational Modules': 'Universal AI Foundational Modules',
  'August 2026 · Credential b8a1b1aa-1d2e-4c81-9c45-822df5f29a29':
    'Αύγουστος 2026 · Πιστοποιητικό b8a1b1aa-1d2e-4c81-9c45-822df5f29a29',
  'Group 1: Biomedical Research Investigators':
    'Group 1: Biomedical Research Investigators',
  'May 2026 – May 2029 · Credential 76841212':
    'Μάιος 2026 – Μάιος 2029 · Πιστοποιητικό 76841212',
  'Docker Essentials: A Developer Introduction':
    'Docker Essentials: A Developer Introduction',
  'May 2024': 'Μάιος 2024',
  'Language certificates': 'Πιστοποιητικά γλωσσομάθειας',
  'ECPE, Certificate of Proficiency in English (C2)':
    'ECPE, Certificate of Proficiency in English (C2)',
  'May 2016': 'Μάιος 2016',
  'ECCE, Certificate of Competency in English (B2)':
    'ECCE, Certificate of Competency in English (B2)',
  'May 2015': 'Μάιος 2015',
  'DELF B2, Diplôme d’études en langue française':
    'DELF B2, Diplôme d’études en langue française',
  'Centre international d’études pédagogiques':
    'Centre international d’études pédagogiques',
  'February 2019': 'Φεβρουάριος 2019',
  'Foundations of modern AI, including artificial neural networks.':
    'Θεμέλια της σύγχρονης τεχνητής νοημοσύνης, συμπεριλαμβανομένων των τεχνητών νευρωνικών δικτύων.',
  'Human-subjects research conduct and ethics, and HIPAA, the compliance side of building for hospitals.':
    'Δεοντολογία και ηθική στην έρευνα με ανθρώπους, και HIPAA, η πλευρά της συμμόρφωσης όταν χτίζεις για νοσοκομεία.',
  'Artificial neural networks': 'Τεχνητά νευρωνικά δίκτυα',

  /* ------------------------------ References -------------------------- */
  Recommendations: 'Συστάσεις',
  'Prof. Panagiotis Tsanakas': 'Καθηγητής Παναγιώτης Τσανάκας',
  'Dean, School of Electrical & Computer Engineering, NTUA':
    'Κοσμήτορας, Σχολή Ηλεκτρολόγων Μηχανικών & Μηχανικών Υπολογιστών, ΕΜΠ',
  'Thesis supervisor and course lecturer · 29 November 2023 · translated from Greek':
    'Επιβλέπων διπλωματικής και διδάσκων · 29 Νοεμβρίου 2023 · το πρωτότυπο στα ελληνικά',
  'Stelios Kandylakis': 'Στέλιος Κανδυλάκης',
  'Senior Product Manager, Financial Data Intelligence':
    'Senior Product Manager, Financial Data Intelligence',
  'Classmate and collaborator at ECE NTUA · November 2025':
    'Συμφοιτητής και συνεργάτης στη Σχολή ΗΜΜΥ ΕΜΠ · Νοέμβριος 2025',
  'Lt Col Georgios Mitsidis': 'Αντισυνταγματάρχης Γεώργιος Μητσίδης',
  'Commander, 575 Marine Battalion': 'Διοικητής, 575 Τάγμα Πεζοναυτών',
  'Commanding officer during the reserve posting · Athens, 24 June 2024':
    'Διοικητής κατά τη διάρκεια της εφεδρικής θητείας · Αθήνα, 24 Ιουνίου 2024',
  'Kyriakos Oikonomou': 'Κυριάκος Οικονόμου',
  'Justice of the Hellenic Supreme Court (Areios Pagos), retired':
    'Αρεοπαγίτης ε.τ.',
  'Vice-President of the Christian Youth Foundation "Pantokrator" since 2020 · Paleo Faliro, 22 November 2023 · translated from Greek':
    'Αντιπρόεδρος του Χριστιανικού Ιδρύματος Νεότητας «Παντοκράτωρ» από το 2020 · Παλαιό Φάληρο, 22 Νοεμβρίου 2023 · το πρωτότυπο στα ελληνικά',

  'Christos (Kitsos) Orfanopoulos was my student in the following undergraduate courses: Operating Systems, and Software Service Technologies. He was a diligent student with a strong interest in the subjects, as his performance in the assignments and examinations of those courses shows. I also had the opportunity to supervise his diploma thesis, on "Compliance analysis of movement exercises using machine learning techniques". That thesis was marked by scientific soundness and technological originality, and was deservedly graded with distinction.':
    'Ο Χρήστος (Κίτσος) Ορφανόπουλος υπήρξε φοιτητής μου στα εξής προπτυχιακά μαθήματα: Λειτουργικά Συστήματα, και Τεχνολογίες Υπηρεσιών Λογισμικού. Υπήρξε επιμελής φοιτητής με έντονο ενδιαφέρον για τα αντικείμενα, όπως δείχνει η επίδοσή του στις εργασίες και τις εξετάσεις των μαθημάτων αυτών. Είχα επίσης την ευκαιρία να επιβλέψω τη διπλωματική του εργασία, με θέμα «Ανάλυση συμμόρφωσης ασκήσεων κίνησης με τεχνικές μηχανικής μάθησης». Η εργασία αυτή διακρινόταν για την επιστημονική της αρτιότητα και την τεχνολογική της πρωτοτυπία, και δικαίως βαθμολογήθηκε με άριστα.',
  'At the same time, Kitsos was active within the Polytechnic, helping younger students through their first academic steps. He contributed as an assistant in the first-year programming labs, answered their questions and shared his notes online. He also wrote a many-page "survival guide" setting down useful advice and observations for every compulsory course in the School.':
    'Παράλληλα, ο Κίτσος δραστηριοποιήθηκε εντός του Πολυτεχνείου, βοηθώντας νεότερους φοιτητές στα πρώτα ακαδημαϊκά τους βήματα. Συνέβαλε ως βοηθός στα εργαστήρια προγραμματισμού του πρώτου έτους, απαντούσε στις απορίες τους και μοιραζόταν τις σημειώσεις του διαδικτυακά. Συνέταξε επίσης έναν πολυσέλιδο «οδηγό επιβίωσης» με χρήσιμες συμβουλές και παρατηρήσεις για κάθε υποχρεωτικό μάθημα της Σχολής.',
  'It is also worth noting that he took a particular interest in confronting a chronic affliction which unfortunately prevails in the Greek university, caused by extreme minorities who created dysfunction and obstructed the normal democratic processes. He led a movement of "Independent Students" with the aim of establishing a system of electronic voting, and met considerable hostility from groups with no connection to the student community. In that context he represented his fellow students with great responsibility in the faculty assemblies, listened to the requests of all sides, and kept everyone continuously informed.':
    'Αξίζει επίσης να σημειωθεί ότι επέδειξε ιδιαίτερο ενδιαφέρον για την αντιμετώπιση μιας χρόνιας παθογένειας που δυστυχώς επικρατεί στο ελληνικό πανεπιστήμιο, προκαλούμενης από ακραίες μειοψηφίες που δημιουργούσαν δυσλειτουργίες και παρεμπόδιζαν τις κανονικές δημοκρατικές διαδικασίες. Ηγήθηκε ενός κινήματος «Ανεξάρτητων Φοιτητών» με στόχο την καθιέρωση συστήματος ηλεκτρονικής ψηφοφορίας, και συνάντησε σημαντική εχθρότητα από ομάδες χωρίς καμία σχέση με τη φοιτητική κοινότητα. Στο πλαίσιο αυτό εκπροσώπησε τους συμφοιτητές του με μεγάλη υπευθυνότητα στις συνελεύσεις της Σχολής, άκουσε τα αιτήματα όλων των πλευρών, και τους κρατούσε διαρκώς ενήμερους.',
  'As a character he stands out for his organisation, his courage and his persistence. He is sincere, cooperative and good-humoured. Judging by his academic course, I am certain that he will excel in his professional career as an electrical and computer engineer.':
    'Ως χαρακτήρας ξεχωρίζει για την οργανωτικότητα, το θάρρος και την επιμονή του. Είναι ειλικρινής, συνεργάσιμος και ευδιάθετος. Κρίνοντας από την ακαδημαϊκή του πορεία, είμαι βέβαιος ότι θα διαπρέψει στην επαγγελματική του σταδιοδρομία ως ηλεκτρολόγος μηχανικός και μηχανικός υπολογιστών.',
  'I highly recommend Christos, with whom I collaborated on numerous university projects and coding competitions while we were both studying at ECE NTUA. He has very strong coding skills, a solution-oriented mindset, and is a person of integrity. Christos always showed strong leadership, making him a valuable asset to any team or organization.':
    'Συστήνω ανεπιφύλακτα τον Χρήστο, με τον οποίο συνεργάστηκα σε πλήθος πανεπιστημιακών εργασιών και διαγωνισμών προγραμματισμού όσο σπουδάζαμε και οι δύο στη Σχολή ΗΜΜΥ του ΕΜΠ. Έχει πολύ δυνατές ικανότητες στον προγραμματισμό, νοοτροπία προσανατολισμένη στη λύση, και είναι άνθρωπος με ακεραιότητα. Ο Χρήστος έδειχνε πάντα ισχυρή ηγετική ικανότητα, κάτι που τον καθιστά πολύτιμο απόκτημα για κάθε ομάδα ή οργανισμό.',
  'Christos V. Orfanopoulos reported to the Unit as an Officer Designate on February 11, 2023 and was released as a Special Forces Second Lieutenant on November 22, 2023 after completing his military service in the Hellenic Armed Forces. During that period, he was assigned as a Platoon Leader and Weapons Officer for a Marine Company.':
    'Ο Χρήστος Β. Ορφανόπουλος παρουσιάστηκε στη Μονάδα ως Δόκιμος Αξιωματικός στις 11 Φεβρουαρίου 2023 και απολύθηκε ως Ανθυπολοχαγός Ειδικών Δυνάμεων στις 22 Νοεμβρίου 2023, έχοντας ολοκληρώσει τη στρατιωτική του θητεία στις Ελληνικές Ένοπλες Δυνάμεις. Κατά το διάστημα αυτό τοποθετήθηκε ως Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών.',
  'While active, he demonstrated exemplary behavior to everyone, accomplished his tasks successfully without the need of supervision and participated with enthusiasm in every activity of the Unit. He was distinguished for his team spirit, his critical thinking, as well as his attention to formality and detail.':
    'Κατά την υπηρεσία του επέδειξε υποδειγματική συμπεριφορά προς όλους, έφερε εις πέρας τα καθήκοντά του με επιτυχία χωρίς να χρειάζεται επίβλεψη, και συμμετείχε με ενθουσιασμό σε κάθε δραστηριότητα της Μονάδας. Διακρίθηκε για το ομαδικό του πνεύμα, την κριτική του σκέψη, καθώς και για την προσοχή του στην τυπικότητα και τη λεπτομέρεια.',
  'Moreover, he demonstrated interest in proposing ideas and implementing best practices for the improvement of the functions of the Unit, and took initiatives for that purpose, following the Command’s guidelines.':
    'Επιπλέον, επέδειξε ενδιαφέρον για την πρόταση ιδεών και την εφαρμογή βέλτιστων πρακτικών για τη βελτίωση της λειτουργίας της Μονάδας, και ανέλαβε πρωτοβουλίες προς τον σκοπό αυτό, ακολουθώντας τις κατευθύνσεις της Διοίκησης.',
  'Undoubtedly, Christos V. Orfanopoulos possesses high professional, leadership and ethical qualifications. I am proud that he has been an Officer in my Unit; he honored the green beret and his tenet, and with the utmost confidence I recommend him as a valuable and trusted partner in every occupational field he will choose.':
    'Αναμφίβολα, ο Χρήστος Β. Ορφανόπουλος διαθέτει υψηλά επαγγελματικά, ηγετικά και ηθικά προσόντα. Είμαι υπερήφανος που υπήρξε Αξιωματικός στη Μονάδα μου· τίμησε τον πράσινο μπερέ και το ιδεώδες του, και με απόλυτη εμπιστοσύνη τον συστήνω ως πολύτιμο και αξιόπιστο συνεργάτη σε κάθε επαγγελματικό πεδίο που θα επιλέξει.',
  'Christos (Kitsos) Orfanopoulos has for a number of years been a volunteer at the Christian Youth Foundation "Pantokrator" of Paleo Faliro, of which I happen to be Vice-President since 2020. During 2021 and 2022 he served as Director of the Foundation, a post he filled in exemplary fashion, leaving behind him significant work and a valuable legacy for those who followed, through the steps he took towards the renovation, upgrading and modernisation of the building infrastructure and of the Foundation’s operations in general.':
    'Ο Χρήστος (Κίτσος) Ορφανόπουλος υπήρξε επί σειρά ετών εθελοντής στο Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» του Παλαιού Φαλήρου, του οποίου τυγχάνω Αντιπρόεδρος από το 2020. Κατά τα έτη 2021 και 2022 διετέλεσε Διευθυντής του Ιδρύματος, θέση την οποία κάλυψε με υποδειγματικό τρόπο, αφήνοντας πίσω του σημαντικό έργο και πολύτιμη παρακαταθήκη για τους επόμενους, μέσα από τα βήματα που έκανε για την ανακαίνιση, την αναβάθμιση και τον εκσυγχρονισμό των κτιριακών υποδομών και της λειτουργίας του Ιδρύματος γενικότερα.',
  'Specifically, when a vacancy arose in the Foundation’s Directorship in 2021, I turned to young Christos, then a student at the National Technical University of Athens, and proposed that he take on the Director’s post, because we considered that his bearing, the traits of his character, the particular quality of his personality, his abilities and above all his warm love for the Foundation made him right for the role. Indeed, when after a year and a half he had to end his work with us, because he had completed his studies and had to fulfil his military obligations, his overall contribution had far exceeded our expectations. The field of his activities was broad, running from the maintenance and management of the premises through to the organisation of events, making the most of the volunteers, and the management of digital media.':
    'Συγκεκριμένα, όταν το 2021 κενώθηκε η θέση της Διεύθυνσης του Ιδρύματος, απευθύνθηκα στον νεαρό Χρήστο, τότε φοιτητή του Εθνικού Μετσοβίου Πολυτεχνείου, και του πρότεινα να αναλάβει τη θέση του Διευθυντή, διότι θεωρήσαμε ότι το παράστημά του, τα γνωρίσματα του χαρακτήρα του, η ιδιαίτερη ποιότητα της προσωπικότητάς του, οι ικανότητές του και πάνω από όλα η θερμή του αγάπη για το Ίδρυμα τον καθιστούσαν κατάλληλο για τον ρόλο. Πράγματι, όταν μετά από ενάμιση χρόνο χρειάστηκε να τερματίσει τη συνεργασία του μαζί μας, επειδή είχε ολοκληρώσει τις σπουδές του και όφειλε να εκπληρώσει τις στρατιωτικές του υποχρεώσεις, η συνολική του συνεισφορά είχε ξεπεράσει κατά πολύ τις προσδοκίες μας. Το πεδίο των δραστηριοτήτων του υπήρξε ευρύ, από τη συντήρηση και τη διαχείριση των εγκαταστάσεων μέχρι την οργάνωση εκδηλώσεων, την αξιοποίηση των εθελοντών και τη διαχείριση των ψηφιακών μέσων.',
  'He was highly organised, focused on his duties, hard-working and conscientious, and kept us regularly informed of everything he did. He continually took on new initiatives and always tried to address the cause of whatever problems he found in the Foundation’s running. He kept good relations with the children of the Foundation, whom he had been called to educate and look after during their time on the premises. He talked with them and took an interest in their problems, and moreover guided them with useful advice, and had succeeded in being trusted and heeded by them. By character he was approachable, welcoming, friendly and particularly likeable.':
    'Υπήρξε άκρως οργανωτικός, προσηλωμένος στα καθήκοντά του, εργατικός και ευσυνείδητος, και μας κρατούσε τακτικά ενήμερους για καθετί που έκανε. Αναλάμβανε συνεχώς νέες πρωτοβουλίες και προσπαθούσε πάντοτε να αντιμετωπίσει την αιτία όποιων προβλημάτων εντόπιζε στη λειτουργία του Ιδρύματος. Διατηρούσε καλές σχέσεις με τα παιδιά του Ιδρύματος, τα οποία είχε κληθεί να εκπαιδεύσει και να φροντίσει κατά την παραμονή τους στις εγκαταστάσεις. Συνομιλούσε μαζί τους και ενδιαφερόταν για τα προβλήματά τους, τα καθοδηγούσε δε με χρήσιμες συμβουλές, και είχε καταφέρει να τον εμπιστεύονται και να τον ακούν. Ως χαρακτήρας ήταν προσιτός, φιλόξενος, φιλικός και ιδιαίτερα συμπαθής.',
  'Christos is distinguished by his sincerity, his discipline and his dedication to every task he undertakes to see through. He is modest, serious, dignified, and a person who inspires trust. I consider Christos Orfanopoulos to be a worthy scientist and a capable professional, and I judge that he will prove useful, effective and indispensable, bringing significant benefit to any business working environment.':
    'Ο Χρήστος διακρίνεται για την ειλικρίνειά του, την πειθαρχία του και την αφοσίωσή του σε κάθε έργο που αναλαμβάνει να φέρει εις πέρας. Είναι μετριόφρων, σοβαρός, αξιοπρεπής, και άνθρωπος που εμπνέει εμπιστοσύνη. Θεωρώ τον Χρήστο Ορφανόπουλο άξιο επιστήμονα και ικανό επαγγελματία, και κρίνω ότι θα αποδειχθεί χρήσιμος, αποτελεσματικός και αναντικατάστατος, προσφέροντας σημαντικό όφελος σε κάθε επιχειρησιακό εργασιακό περιβάλλον.',

  /* ----------------------------- Campus life -------------------------- */
  'Five-year integrated Master of Engineering in the School of Electrical and Computer Engineering, the most competitive school in Greece to get into, where only the top entrance-exam grades make it.':
    'Πενταετές ενιαίο δίπλωμα Master of Engineering στη Σχολή Ηλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών, η πιο ανταγωνιστική σχολή της Ελλάδας στην εισαγωγή, όπου περνούν μόνο οι κορυφαίες βαθμολογίες των πανελληνίων.',
  'Finished in the five years the programme is designed for; the average student takes about seven and a half.':
    'Ολοκληρώθηκε στα πέντε χρόνια που προβλέπει το πρόγραμμα· ο μέσος φοιτητής χρειάζεται περίπου εφτάμισι.',
  'Worked alongside the degree from the third year: part-time at first, then full-time as Director of the "Pantokrator" Foundation through the fourth and fifth.':
    'Δούλευε παράλληλα με τις σπουδές από το τρίτο έτος: μερική απασχόληση στην αρχή, μετά πλήρης ως Διευθυντής του Ιδρύματος «Παντοκράτωρ» στο τέταρτο και το πέμπτο.',
  'The Independent movement': 'Το Ανεξάρτητο κίνημα',
  'In his third year, party-political groups ran the faculty assemblies and students’ own problems went unheard. He co-founded an independent movement of ECE students to win real representation by democratic means.':
    'Στο τρίτο του έτος τις Γενικές Συνελεύσεις της Σχολής τις κρατούσαν κομματικές παρατάξεις και τα πραγματικά προβλήματα των φοιτητών δεν ακούγονταν. Συνίδρυσε ένα ανεξάρτητο κίνημα φοιτητών ΗΜΜΥ, για πραγματική εκπροσώπηση με δημοκρατικά μέσα.',
  'Ran a petition that more than 700 students signed in two days.':
    'Οργάνωσε ψήφισμα που υπέγραψαν πάνω από 700 φοιτητές σε δύο μέρες.',
  'Spoke at the councils and at a general meeting of 800.':
    'Μίλησε στα συμβούλια και σε γενική συνέλευση 800 ατόμων.',
  'Appointed by the Dean of the School as independent students’ representative, and served two years in the open, always saying what he was doing, and why.':
    'Ορίστηκε από τον Κοσμήτορα της Σχολής ανεξάρτητος εκπρόσωπος των φοιτητών, και υπηρέτησε δύο χρόνια με διαφάνεια, λέγοντας πάντα τι έκανε, και γιατί.',
  'Campaigned for e-voting and for keeping party politics out of the assembly; took real hostility from groups outside the student body, and kept going anyway.':
    'Αγωνίστηκε για ηλεκτρονική ψηφοφορία και για να μείνουν τα κόμματα έξω από τη συνέλευση· δέχτηκε πραγματική εχθρότητα από ομάδες εκτός της φοιτητικής κοινότητας, και συνέχισε παρ’ όλα αυτά.',
  'Volunteering on campus': 'Εθελοντισμός στη σχολή',

  /* --------------------------- The Survival Guide --------------------- */
  'The Survival Guide': 'Ο Οδηγός Επιβίωσης',
  'A hundred and ten pages for new students: what each compulsory course is, how it is run, how it is examined, and how to get through it, written while he was getting through it himself. Years later it is still passed from year to year, and some of the students reading it are not sure the author was real.':
    'Εκατόν δέκα σελίδες για τους νέους φοιτητές: τι είναι κάθε υποχρεωτικό μάθημα, πώς γίνεται, πώς εξετάζεται, και πώς το περνάς, γραμμένες όσο το περνούσε ο ίδιος. Χρόνια μετά δίνεται ακόμη από έτος σε έτος, και κάποιοι από όσους τον διαβάζουν δεν είναι σίγουροι ότι ο συγγραφέας υπήρξε.',
  Pages: 'Σελίδες',
  Courses: 'Μαθήματα',
  'Every compulsory one': 'Κάθε υποχρεωτικό',
  'Still in use': 'Σε χρήση ακόμη',
  'Years later': 'Χρόνια μετά',
  'Teaching the year below': 'Διδασκαλία στο μικρότερο έτος',
  'Assisted in the first-year programming laboratories as a lab instructor.':
    'Βοήθησε στα εργαστήρια προγραμματισμού του πρώτου έτους ως βοηθός εργαστηρίου.',
  'Took part in class, uploaded his notes, and posted worked solutions on the student forums.':
    'Συμμετείχε στα μαθήματα, ανέβαζε τις σημειώσεις του, και δημοσίευε λυμένες ασκήσεις στα φοιτητικά forum.',
  'Many projects along the way, and the diploma thesis: a phone application that watches a movement through a neural network, recognises it and assesses how well it was performed.':
    'Πολλές εργασίες στη διαδρομή, και η διπλωματική: μια εφαρμογή για κινητό που παρακολουθεί μια κίνηση μέσα από νευρωνικό δίκτυο, την αναγνωρίζει και αξιολογεί πόσο καλά εκτελέστηκε.',

  /* ----------------------------- The transcript ----------------------- */
  'The transcript': 'Η αναλυτική βαθμολογία',
  'Course average': 'Μέσος όρος μαθημάτων',
  'Diploma thesis': 'Διπλωματική',
  Overall: 'Γενικός μέσος όρος',
  'Time to finish': 'Χρόνος ολοκλήρωσης',
  '5 years': '5 χρόνια',
  'Semester 1': 'Εξάμηνο 1',
  'Semester 2': 'Εξάμηνο 2',
  'Semester 3': 'Εξάμηνο 3',
  'Semester 4': 'Εξάμηνο 4',
  'Semester 5': 'Εξάμηνο 5',
  'Semester 6': 'Εξάμηνο 6',
  'Semester 7': 'Εξάμηνο 7',
  'Semester 8': 'Εξάμηνο 8',
  'Semester 9': 'Εξάμηνο 9',
  'Introduction to Programming · 10': 'Εισαγωγή στον Προγραμματισμό · 10',
  'Logic Design · 10': 'Λογική Σχεδίαση Ψηφιακών Συστημάτων · 10',
  'Linear Algebra · 10': 'Γραμμική Άλγεβρα · 10',
  'Physics · 8': 'Φυσική · 8',
  'Calculus I · 7': 'Μαθηματική Ανάλυση Ι · 7',
  'History · 10': 'Ιστορία · 10',
  'Programming Techniques · 10': 'Τεχνικές Προγραμματισμού · 10',
  'Electric Circuits · 10': 'Ηλεκτρικά Κυκλώματα · 10',
  'Electrical Engineering Materials · 10': 'Ηλεκτροτεχνικά Υλικά · 10',
  'Differential Equations · 9': 'Διαφορικές Εξισώσεις · 9',
  'Calculus II · 6': 'Μαθηματική Ανάλυση ΙΙ · 6',
  'Engineering Mechanics · 10': 'Τεχνική Μηχανική · 10',
  'Electrical Measurements · 10': 'Ηλεκτρικές Μετρήσεις · 10',
  'Logic Design Lab · 9': 'Εργαστήριο Λογικής Σχεδίασης · 9',
  'Foundations of Computer Science · 7':
    'Θεμελιώσεις Επιστήμης Υπολογιστών · 7',
  'Signals & Systems · 7': 'Σήματα και Συστήματα · 7',
  'Probability & Statistics · 6': 'Πιθανότητες και Στατιστική · 6',
  'Computer Organisation · 9': 'Οργάνωση Υπολογιστών · 9',
  'Communication Networks · 10': 'Δίκτυα Επικοινωνιών · 10',
  'Waves & Quantum Physics · 6': 'Κυματική και Κβαντική Φυσική · 6',
  'Stochastic Processes · Pass': 'Στοχαστικές Διαδικασίες · Επιτυχώς',
  'Electronics I · 7': 'Ηλεκτρονική Ι · 7',
  'Electromagnetic Fields A · 5': 'Ηλεκτρομαγνητικά Πεδία Α · 5',
  'Discrete Mathematics · 7': 'Διακριτά Μαθηματικά · 7',
  'English · 10': 'Αγγλικά · 10',
  'Industrial Electronics · 6': 'Βιομηχανική Ηλεκτρονική · 6',
  'Telecommunications · 5': 'Τηλεπικοινωνίες · 5',
  'Computer Architecture · 7': 'Αρχιτεκτονική Υπολογιστών · 7',
  'Control Systems · 6': 'Συστήματα Αυτομάτου Ελέγχου · 6',
  'Electric Power Systems · 5': 'Συστήματα Ηλεκτρικής Ενέργειας · 5',
  'Electromagnetic Fields B · 5': 'Ηλεκτρομαγνητικά Πεδία Β · 5',
  'Network & Circuit Theory · 6': 'Θεωρία Δικτύων και Κυκλωμάτων · 6',
  'Operating Systems · 10': 'Λειτουργικά Συστήματα · 10',
  'Microcomputers · 8': 'Μικροϋπολογιστές · 8',
  'Programming Languages I · 6': 'Γλώσσες Προγραμματισμού Ι · 6',
  'Databases · Pass': 'Βάσεις Δεδομένων · Επιτυχώς',
  'Queueing Systems · 5': 'Συστήματα Αναμονής · 5',
  'Management Systems · 9': 'Συστήματα Διοίκησης · 9',
  'Electrical Drawing · Pass': 'Ηλεκτρολογικό Σχέδιο · Επιτυχώς',
  'Human–Computer Interaction · 10': 'Αλληλεπίδραση Ανθρώπου–Υπολογιστή · 10',
  'Multimedia · 10': 'Πολυμέσα · 10',
  'Operating Systems Lab · 6': 'Εργαστήριο Λειτουργικών Συστημάτων · 6',
  'Algorithms · 6': 'Αλγόριθμοι · 6',
  'Software Engineering · 8': 'Τεχνολογία Λογισμικού · 8',
  'Computer Networks · 8': 'Δίκτυα Υπολογιστών · 8',
  'Decision Support Systems · 8': 'Συστήματα Αποφάσεων · 8',
  'Advanced Computer Architecture · 8':
    'Προηγμένα Θέματα Αρχιτεκτονικής Υπολογιστών · 8',
  'Software as a Service · 9': 'Τεχνολογίες Υπηρεσιών Λογισμικού · 9',
  'Internet Protocols · Pass': 'Πρωτόκολλα Διαδικτύου · Επιτυχώς',
  'Security · 7': 'Ασφάλεια · 7',
  'Forecasting Techniques · 8': 'Τεχνικές Προβλέψεων · 8',
  'Digital Enterprise Management · 9': 'ΔΨΕ · 9',
  'Electromagnetic Compatibility · 10': 'Ηλεκτρομαγνητική Συμβατότητα · 10',
  'Neural Networks · 6': 'Νευρωνικά Δίκτυα · 6',
  'Information Systems · 10': 'Πληροφοριακά Συστήματα · 10',
  'Advanced Databases · 7': 'Προχωρημένες Βάσεις Δεδομένων · 7',
  'European Researchers’ Night, NTUA (2019)': 'Βραδιά του Ερευνητή, ΕΜΠ (2019)',
  '100 years of ECE celebration, NTUA (2017)':
    'Εορτασμός 100 χρόνων ΗΜΜΥ, ΕΜΠ (2017)',

  /* -------------------------------- Work ------------------------------ */
  'Veltiston AI, two and a half years': 'Veltiston AI, δυόμισι χρόνια',
  'Joined an AI healthcare startup founded by MIT Professor Dimitris Bertsimas as one of its first engineers, and grew into Technical Lead of the flagship Nurse Scheduling platform, concept to production, with teams across Greece, Boston and Morocco.':
    'Μπήκε σε μια startup τεχνητής νοημοσύνης για την υγεία, ιδρυμένη από τον καθηγητή του MIT Δημήτρη Μπερτσιμά, ως ένας από τους πρώτους μηχανικούς της, και εξελίχθηκε σε Technical Lead της ναυαρχίδας της, της πλατφόρμας Nurse Scheduling, από τη σύλληψη ως την παραγωγή, με ομάδες σε Ελλάδα, Βοστώνη και Μαρόκο.',
  'Veltiston AI · Athens, hybrid': 'Veltiston AI · Αθήνα, υβριδικά',
  'May 2026 – present': 'Μάιος 2026 – σήμερα',
  'Full-stack Software Engineer': 'Full-stack Software Engineer',
  'May 2024 – May 2026': 'Μάιος 2024 – Μάιος 2026',
  'What I shipped': 'Τι παρέδωσα',
  'Secure and scalable, or it does not ship.':
    'Ασφαλές και κλιμακώσιμο, αλλιώς δεν βγαίνει.',
  Observability: 'Παρατηρησιμότητα',
  Delivery: 'Παράδοση',
  Testing: 'Δοκιμές',
  'Before the startup': 'Πριν από τη startup',
  'DevOps Engineer': 'DevOps Engineer',
  'IBM · Athens, on-site': 'IBM · Αθήνα, με φυσική παρουσία',
  'November 2023 – May 2024': 'Νοέμβριος 2023 – Μάιος 2024',
  'Project lead on three projects.': 'Υπεύθυνος σε τρία έργα.',
  'Leads cross-functional teams of 5–10 developers: architecture, technical decisions, code reviews, sprint planning and customer delivery.':
    'Ηγείται διαλειτουργικών ομάδων 5–10 προγραμματιστών: αρχιτεκτονική, τεχνικές αποφάσεις, code reviews, sprint planning και παράδοση στον πελάτη.',
  'Mentors engineers, runs technical interviews and coordinates distributed international teams.':
    'Καθοδηγεί μηχανικούς, διεξάγει τεχνικές συνεντεύξεις και συντονίζει κατανεμημένες διεθνείς ομάδες.',
  'Works with Product, Design, QA and DevOps to deliver weekly production releases.':
    'Συνεργάζεται με Product, Design, QA και DevOps για εβδομαδιαίες εκδόσεις στην παραγωγή.',
  'One of the company’s first engineers; built the flagship Nurse Scheduling platform from concept to production.':
    'Ένας από τους πρώτους μηχανικούς της εταιρείας· έχτισε τη ναυαρχίδα της, την πλατφόρμα Nurse Scheduling, από τη σύλληψη ως την παραγωγή.',
  'Led production deployments across major U.S. hospitals, working directly with hospital stakeholders.':
    'Ηγήθηκε των εγκαταστάσεων σε παραγωγή σε μεγάλα νοσοκομεία των ΗΠΑ, σε άμεση συνεργασία με τους εμπλεκόμενους των νοσοκομείων.',
  'Modernized legacy applications: Agile practices, engineering standards, CI/CD pipelines, documentation, automated testing and incremental refactoring.':
    'Εκσυγχρόνισε παλαιές εφαρμογές: Agile πρακτικές, πρότυπα μηχανικής, pipelines CI/CD, τεκμηρίωση, αυτοματοποιημένες δοκιμές και σταδιακό refactoring.',
  'Also the software lead at Holistic Hospital Optimization, its sister company in the Dynamic Ideas group: AI-powered applications for U.S. hospitals, from nurse scheduling to length-of-stay optimization and SMART on FHIR integrations.':
    'Επίσης επικεφαλής λογισμικού στη Holistic Hospital Optimization, την αδελφή της εταιρεία στον όμιλο Dynamic Ideas: εφαρμογές με τεχνητή νοημοσύνη για νοσοκομεία των ΗΠΑ, από τον προγραμματισμό βαρδιών νοσηλευτών ως τη βελτιστοποίηση διάρκειας νοσηλείας και τις ενσωματώσεις SMART on FHIR.',
  'The flagship Nurse Scheduling platform, live in major U.S. hospitals.':
    'Η ναυαρχίδα πλατφόρμα Nurse Scheduling, σε παραγωγή σε μεγάλα νοσοκομεία των ΗΠΑ.',
  'Technical lead on every one of these: the architecture, the decisions, the reviews and the delivery into the hospital.':
    'Technical lead σε κάθε ένα από αυτά: η αρχιτεκτονική, οι αποφάσεις, οι ανασκοπήσεις και η παράδοση μέσα στο νοσοκομείο.',
  'A React Native mobile app for the nurses themselves: their schedule, their shift preferences and the rest of the platform on their phone, not only on the web.':
    'Εφαρμογή κινητού σε React Native για τους ίδιους τους νοσηλευτές: το πρόγραμμά τους, οι προτιμήσεις βαρδιών τους και η υπόλοιπη πλατφόρμα στο κινητό τους, όχι μόνο στο web.',
  'An AI-powered documentation assistant built on Spring AI, retrieval-augmented generation and agentic AI.':
    'Βοηθός τεκμηρίωσης με τεχνητή νοημοσύνη, χτισμένος πάνω σε Spring AI, retrieval-augmented generation και agentic AI.',
  'A SMART on FHIR application embedded inside Epic EHR.':
    'Εφαρμογή SMART on FHIR ενσωματωμένη μέσα στο Epic EHR.',
  'A Length of Stay analytics plugin delivered into Epic EHR through SMART on FHIR.':
    'Plugin αναλυτικής διάρκειας νοσηλείας, παραδοτέο στο Epic EHR μέσω SMART on FHIR.',
  'Integration with UKG workforce management systems.':
    'Ενσωμάτωση με συστήματα διαχείρισης προσωπικού UKG.',
  'SAML 2.0 single sign-on against Microsoft ADFS.':
    'Single sign-on με SAML 2.0 απέναντι σε Microsoft ADFS.',
  'A secure notification framework and comprehensive activity audit logging, reaching nurses through Microsoft Teams and Twilio SMS.':
    'Ασφαλές framework ειδοποιήσεων και πλήρες audit logging δραστηριότητας, που φτάνει στους νοσηλευτές μέσω Microsoft Teams και Twilio SMS.',
  'A Jira-integrated ticketing system with Google reCAPTCHA for secure issue submission and workflow automation.':
    'Σύστημα αιτημάτων ενσωματωμένο με Jira και Google reCAPTCHA για ασφαλή υποβολή και αυτοματοποίηση ροών.',
  'HIPAA-compliant security and data handling architecture across all of it.':
    'Αρχιτεκτονική ασφάλειας και διαχείρισης δεδομένων σύμφωνη με το HIPAA σε όλα τα παραπάνω.',
  'Selected for the IBM Associate Program, training in DevOps and integration.':
    'Επιλεγμένος για το IBM Associate Program, με εκπαίδευση σε DevOps και ενσωματώσεις.',
  'Worked on the Cosmos Project at the National Bank of Greece, a core banking transformation migrating legacy PL/I and COBOL systems to Infosys Finacle.':
    'Εργάστηκε στο έργο Cosmos της Εθνικής Τράπεζας της Ελλάδος, μετασχηματισμός του βασικού τραπεζικού συστήματος με μετάβαση από PL/I και COBOL στο Infosys Finacle.',
  'Coordinated integration calls across bank subsystems to support Finacle onboarding.':
    'Συντόνισε τις συσκέψεις ενσωμάτωσης μεταξύ των υποσυστημάτων της τράπεζας για την υποστήριξη της μετάβασης στο Finacle.',
  'Designed integration architecture for both the transitional coexistence state and the target state.':
    'Σχεδίασε την αρχιτεκτονική ενσωμάτωσης τόσο για το μεταβατικό στάδιο συνύπαρξης όσο και για το τελικό.',
  'Supported DevOps operations: ticket deployments and CI/CD pipeline automation.':
    'Υποστήριξε τις λειτουργίες DevOps: εγκαταστάσεις αιτημάτων και αυτοματοποίηση pipelines CI/CD.',
  'Represented IBM Greece at an international Agile & Enterprise Design Thinking bootcamp in Hamburg, February 2024.':
    'Εκπροσώπησε την IBM Ελλάδος σε διεθνές bootcamp Agile & Enterprise Design Thinking στο Αμβούργο, Φεβρουάριος 2024.',

  /* ------------------------------- Skills ----------------------------- */
  Backend: 'Backend',
  AI: 'Τεχνητή νοημοσύνη',
  Frontend: 'Frontend',
  Databases: 'Βάσεις δεδομένων',
  'Cloud & DevOps': 'Cloud & DevOps',
  'Observability & monitoring': 'Παρατηρησιμότητα & παρακολούθηση',
  'Architecture & design': 'Αρχιτεκτονική & σχεδιασμός',
  'Healthcare & security': 'Υγεία & ασφάλεια',

  /* -------------------------------- Army ------------------------------ */
  'Reservist Second Lieutenant, Special Forces':
    'Έφεδρος Ανθυπολοχαγός, Ειδικές Δυνάμεις',
  'Hellenic Armed Forces, 575 Marine Battalion':
    'Ελληνικές Ένοπλες Δυνάμεις, 575 Τάγμα Πεζοναυτών',
  'September 2022 – 22 November 2023': 'Σεπτέμβριος 2022 – 22 Νοεμβρίου 2023',
  'What the job actually was': 'Τι ήταν στην πραγματικότητα η δουλειά',
  'Same discipline, different terrain: stand-ups instead of formations, on-call instead of watch.':
    'Ίδια πειθαρχία, άλλο έδαφος: stand-up αντί για ζυγίσματα, on-call αντί για σκοπιά.',
  'Basic training at the Center of Special Forces, Nea Peramos.':
    'Βασική εκπαίδευση στο Κέντρο Εκπαίδευσης Ειδικών Δυνάμεων, Νέα Πέραμος.',
  'Graduated 3rd in class from the Infantry Reserve Officers School, Heraklion.':
    'Αποφοίτησε 3ος της σειράς του από τη Σχολή Εφέδρων Αξιωματικών Πεζικού, Ηράκλειο.',
  'Completed the Rangers’ Basic Training School (Guerilla Warfare School), Rentina.':
    'Ολοκλήρωσε τη Βασική Σχολή Καταδρομών (Σχολείο Ανταρτοπολέμου), Ρεντίνα.',
  'Reported to the 575 Marine Battalion as an Officer Designate on 11 February 2023.':
    'Παρουσιάστηκε στο 575 Τάγμα Πεζοναυτών ως Δόκιμος Αξιωματικός στις 11 Φεβρουαρίου 2023.',
  'Served as Platoon Leader and Weapons Officer for a Marine Company, and as Deputy Company Commander.':
    'Υπηρέτησε ως Διμοιρίτης και Αξιωματικός Οπλισμού σε Λόχο Πεζοναυτών, και ως Υποδιοικητής Λόχου.',
  'Released as a Special Forces Second Lieutenant, having earned the green beret.':
    'Απολύθηκε ως Ανθυπολοχαγός Ειδικών Δυνάμεων, έχοντας κερδίσει τον πράσινο μπερέ.',
  'Led and supervised personnel through training and field operations.':
    'Ηγήθηκε και επέβλεψε προσωπικό σε εκπαίδευση και επιχειρήσεις πεδίου.',
  'Coordinated logistics, weaponry and readiness for company-level exercises.':
    'Συντόνισε τον εφοδιασμό, τον οπλισμό και την ετοιμότητα για ασκήσεις επιπέδου λόχου.',
  'Held the line on discipline, operational efficiency and safety compliance.':
    'Κράτησε τη γραμμή στην πειθαρχία, την επιχειρησιακή αποτελεσματικότητα και την τήρηση της ασφάλειας.',
  'Acted as liaison between commanding officers and enlisted troops.':
    'Λειτούργησε ως σύνδεσμος μεταξύ των διοικούντων αξιωματικών και των οπλιτών.',

  /* ----------------------------- Volunteering ------------------------- */
  'Running a youth foundation': 'Διεύθυνση ιδρύματος νεότητας',
  Director: 'Διευθυντής',
  'Christian Youth Foundation "Pantokrator" · Paleo Faliro':
    'Χριστιανικό Ίδρυμα Νεότητας «Παντοκράτωρ» · Παλαιό Φάληρο',
  'February 2021 – September 2022': 'Φεβρουάριος 2021 – Σεπτέμβριος 2022',
  'Still going': 'Συνεχίζονται',
  'Appointed by the foundation’s council after years as a volunteer, while finishing the degree. The Vice-President approached him directly to fill the vacancy.':
    'Διορίστηκε από το συμβούλιο του ιδρύματος μετά από χρόνια ως εθελοντής, ενώ τελείωνε τη σχολή. Ο Αντιπρόεδρος απευθύνθηκε προσωπικά σε αυτόν για να καλύψει τη θέση.',
  'Renovated, upgraded and modernised the building infrastructure and the foundation’s day-to-day operations.':
    'Ανακαίνισε, αναβάθμισε και εκσυγχρόνισε τις κτιριακές υποδομές και την καθημερινή λειτουργία του ιδρύματος.',
  'Supervised and taught the children in the foundation’s programmes.':
    'Επέβλεψε και δίδαξε τα παιδιά στα προγράμματα του ιδρύματος.',
  'Coordinated staff and volunteers, and managed the facilities themselves.':
    'Συντόνισε προσωπικό και εθελοντές, και διαχειρίστηκε τις ίδιες τις εγκαταστάσεις.',
  'Organised athletic, theatrical, cultural and ecological events, field trips and youth activities.':
    'Οργάνωσε αθλητικές, θεατρικές, πολιτιστικές και οικολογικές εκδηλώσεις, εκδρομές και δραστηριότητες νέων.',
  'Led charitable initiatives: tree planting, donation drives and outreach to vulnerable groups.':
    'Ηγήθηκε φιλανθρωπικών πρωτοβουλιών: δενδροφυτεύσεις, συγκεντρώσεις προσφορών και δράσεις για ευάλωτες ομάδες.',
  'Built the foundation’s presence on social media and YouTube, and ran live streaming through the COVID-19 lockdowns.':
    'Έχτισε την παρουσία του ιδρύματος στα κοινωνικά δίκτυα και στο YouTube, και έτρεξε ζωντανές μεταδόσεις στα lockdown του COVID-19.',
  'Oversaw financial operations and pursued alternative funding through grants and partnerships.':
    'Επέβλεψε τα οικονομικά και αναζήτησε εναλλακτική χρηματοδότηση μέσω επιχορηγήσεων και συνεργασιών.',
  'Kept the board and the municipal authorities in the loop.':
    'Κρατούσε ενήμερα το διοικητικό συμβούλιο και τις δημοτικές αρχές.',
  'People management': 'Διαχείριση ανθρώπων',
  'Facility management': 'Διαχείριση εγκαταστάσεων',
  'Event management': 'Διοργάνωση εκδηλώσεων',
  'Financial oversight': 'Οικονομική εποπτεία',
  'Leading volunteer at the same foundation, 2017–2021 and 2023 to today':
    'Επικεφαλής εθελοντής στο ίδιο ίδρυμα, 2017–2021 και από το 2023 ως σήμερα',
  'Children’s tutor in Robotics at Citylab, Alimos, 2020–2021':
    'Εκπαιδευτής παιδιών στη Ρομποτική στο Citylab, Άλιμος, 2020–2021',
  'Blood donor since 2017': 'Αιμοδότης από το 2017',

  /* ------------------------------ The radio --------------------------- */
  'Open channels': 'Ανοιχτά κανάλια',
  'The Radio Center broadcasts on three frequencies. Pick one and the message goes straight to me, with no operator in between.':
    'Το Ραδιοφωνικό Κέντρο εκπέμπει σε τρεις συχνότητες. Διάλεξε μία και το μήνυμα έρχεται κατευθείαν σε μένα, χωρίς κανέναν χειριστή στη μέση.',

  /* -------------------------- The keeper’s logbook -------------------- */
  'Senior full-stack engineer and technical lead with a track record of taking healthcare products from concept to production. Java and Spring Boot on the backend, React on the front, AWS underneath, and teams of 5–10 engineers across three countries shipping weekly into U.S. hospitals under HIPAA.':
    'Senior full-stack μηχανικός και technical lead, με πορεία στο να πηγαίνει προϊόντα υγείας από τη σύλληψη ως την παραγωγή. Java και Spring Boot στο backend, React στο front, AWS από κάτω, και ομάδες 5–10 μηχανικών σε τρεις χώρες που παραδίδουν κάθε εβδομάδα σε νοσοκομεία των ΗΠΑ, με συμμόρφωση στο HIPAA.',
  Now: 'Τώρα',
  'Senior Software Engineer, Veltiston AI':
    'Senior Software Engineer, Veltiston AI',
  'Core stack': 'Βασική στοίβα',
  Team: 'Ομάδα',
  '5–10 engineers, 3 countries': '5–10 μηχανικοί, 3 χώρες',
  Cadence: 'Ρυθμός',
  'Weekly production releases': 'Εβδομαδιαίες εκδόσεις στην παραγωγή',
  'What I am actually good at': 'Σε τι είμαι πραγματικά καλός',
  'What I am looking for': 'Τι ψάχνω',
  'Hard problems with real users attached, a team that reviews each other honestly, and enough ownership to fix the root cause instead of the symptom. Remote, hybrid or Athens-based.':
    'Δύσκολα προβλήματα με πραγματικούς χρήστες από πίσω, μια ομάδα που κάνει ειλικρινή review ο ένας στον άλλο, και αρκετή ιδιοκτησία ώστε να διορθώνεις την αιτία αντί για το σύμπτωμα. Εξ αποστάσεως, υβριδικά ή στην Αθήνα.',
  'If the island convinced you, the Radio Center is a two-minute walk south.':
    'Αν σε έπεισε το νησί, το Ραδιοφωνικό Κέντρο απέχει δύο λεπτά με τα πόδια προς τον νότο.',
  'Owning a system end to end (schema, service, API, UI, pipeline, dashboard) instead of one slice of it.':
    'Να έχω ένα σύστημα από άκρη σε άκρη (σχήμα, υπηρεσία, API, διεπαφή, pipeline, dashboard) αντί για μία φέτα του.',
  'Taking a legacy codebase nobody wants to touch and making it shippable again, in increments, without a rewrite.':
    'Να παίρνω έναν παλιό κώδικα που κανείς δεν θέλει να αγγίξει και να τον ξανακάνω παραδοτέο, σταδιακά, χωρίς να τον ξαναγράψω.',
  'Leading engineers across time zones: reviews that teach, sprints that finish, decisions that are written down.':
    'Να ηγούμαι μηχανικών σε διαφορετικές ζώνες ώρας: review που διδάσκουν, sprint που τελειώνουν, αποφάσεις που καταγράφονται.',
  'Working where correctness is not negotiable: healthcare data, HIPAA, audit trails, Epic and FHIR integrations.':
    'Να δουλεύω εκεί όπου η ορθότητα δεν είναι διαπραγματεύσιμη: δεδομένα υγείας, HIPAA, ίχνη ελέγχου, ενσωματώσεις Epic και FHIR.',
  'Translating between hospital stakeholders, product and engineering without losing detail in either direction.':
    'Να μεταφράζω ανάμεσα στους εμπλεκόμενους των νοσοκομείων, το προϊόν και τη μηχανική χωρίς να χάνεται λεπτομέρεια προς καμία κατεύθυνση.',

  /* ------------------------------ The family -------------------------- */
  'Seven of us: my father, my mother, three brothers, my sister and me. One bathroom, one table, and never a quiet evening in the whole of it.':
    'Επτά μας: ο πατέρας μου, η μητέρα μου, τρία αδέλφια, η αδελφή μου και εγώ. Ένα μπάνιο, ένα τραπέζι, και ούτε ένα ήσυχο βράδυ σε όλα αυτά.',
  'A big family is a small organisation. Nobody hands you a role. You find the thing that needs doing and you do it, because if you wait for somebody else the thing does not get done. That is the whole of it, and I have not found a team since where it was not also true.':
    'Μια μεγάλη οικογένεια είναι ένας μικρός οργανισμός. Κανείς δεν σου δίνει ρόλο. Βρίσκεις αυτό που πρέπει να γίνει και το κάνεις, γιατί αν περιμένεις κάποιον άλλο δεν θα γίνει. Αυτό είναι όλο, και δεν έχω βρει από τότε ομάδα όπου να μην ισχύει κι εκεί.',
  'My siblings were my first friends, and they are still the ones who knew me before I had anything to show.':
    'Τα αδέλφια μου ήταν οι πρώτοι μου φίλοι, και είναι ακόμη αυτοί που με ήξεραν πριν έχω τίποτα να δείξω.',
  'Responsibility, because with five children something is always somebody’s job and often it was mine':
    'Ευθύνη, γιατί με πέντε παιδιά κάτι είναι πάντα δουλειά κάποιου και συχνά ήταν δική μου',
  'Initiative, because asking permission for everything in a house that size means never doing anything':
    'Πρωτοβουλία, γιατί το να ζητάς άδεια για το καθετί σε σπίτι τέτοιου μεγέθους σημαίνει να μην κάνεις ποτέ τίποτα',
  'Patience, learned the hard way and mostly from my brothers':
    'Υπομονή, μαθημένη με τον δύσκολο τρόπο και κυρίως από τα αδέλφια μου',
  'That being loved and being agreed with are completely different things':
    'Ότι το να σε αγαπούν και το να συμφωνούν μαζί σου είναι εντελώς διαφορετικά πράγματα',

  /* ------------------------------- Garage ----------------------------- */
  'Tools on the board, bench along the back wall, car nosed at the shutter and the bicycle against the other. Half the furniture upstairs was built on this bench.':
    'Εργαλεία στο ταμπλό, πάγκος στον πίσω τοίχο, το αυτοκίνητο με τη μούρη στο ρολό και το ποδήλατο στον απέναντι. Τα μισά έπιπλα του πάνω ορόφου φτιάχτηκαν σε αυτόν τον πάγκο.',
  'DIY is the same loop as engineering, with a shorter feedback cycle and worse consequences: measure, cut, discover the wall is not square, adapt. Nothing teaches you to respect a tolerance like a shelf that will not sit level.':
    'Τα μαστορέματα είναι ο ίδιος βρόχος με τη μηχανική, με πιο σύντομο κύκλο ανατροφοδότησης και χειρότερες συνέπειες: μέτρα, κόψε, ανακάλυψε ότι ο τοίχος δεν είναι ίσιος, προσαρμόσου. Τίποτα δεν σου μαθαίνει να σέβεσαι μια ανοχή όσο ένα ράφι που δεν κάθεται αλφάδι.',
  'The rest of the hobbies live somewhere between here and the front door: running and cycling, where the thinking happens somewhere around kilometre six; hiking and camping, usually somewhere with no signal; chess, badly but stubbornly; and theater, from the audience these days.':
    'Τα υπόλοιπα ενδιαφέροντα ζουν κάπου ανάμεσα σε εδώ και την εξώπορτα: τρέξιμο και ποδήλατο, όπου η σκέψη γίνεται κάπου στο έκτο χιλιόμετρο· πεζοπορία και κάμπινγκ, συνήθως κάπου χωρίς σήμα· σκάκι, άσχημα αλλά πεισματικά· και θέατρο, από την πλατεία πια.',
  'Wood, mostly: shelving, tables, whatever the flat needs':
    'Ξύλο, κυρίως: ράφια, τραπέζια, ό,τι χρειάζεται το σπίτι',
  'The bicycle gets stripped and rebuilt more often than it strictly needs':
    'Το ποδήλατο λύνεται και ξαναχτίζεται πιο συχνά απ’ όσο χρειάζεται στ’ αλήθεια',
  'Every tool goes back on the board, which took years to become true':
    'Κάθε εργαλείο επιστρέφει στο ταμπλό, κάτι που χρειάστηκε χρόνια για να γίνει αλήθεια',

  /* -------------------------------- Lab ------------------------------- */
  'A mini server in the corner running Linux, and enough electronics on the bench to make something blink by the end of an evening. It is not a showpiece. It is where I try the thing before I trust it at work.':
    'Ένας μικρός σέρβερ στη γωνία με Linux, και αρκετά ηλεκτρονικά στον πάγκο ώστε να κάνεις κάτι να αναβοσβήνει μέχρι το τέλος του βραδιού. Δεν είναι βιτρίνα. Είναι εκεί που δοκιμάζω κάτι πριν το εμπιστευτώ στη δουλειά.',
  'Everything I know about operations I learned by breaking my own machine at eleven at night with nobody to escalate to. You read the logs because there is no one else to read them.':
    'Ό,τι ξέρω για τη λειτουργία συστημάτων το έμαθα χαλώντας το δικό μου μηχάνημα στις έντεκα το βράδυ, χωρίς κανέναν να κλιμακώσω. Διαβάζεις τα logs επειδή δεν υπάρχει κανείς άλλος να τα διαβάσει.',
  'One small Linux box, doing more jobs than it was ever sold to do':
    'Ένα μικρό κουτί με Linux, που κάνει περισσότερες δουλειές απ’ όσες πουλήθηκε να κάνει',
  'Microcontrollers, a soldering iron, and a drawer of components sorted with real optimism':
    'Μικροελεγκτές, ένα κολλητήρι, και ένα συρτάρι εξαρτημάτων ταξινομημένο με πραγματική αισιοδοξία',
  'The place where a bad idea gets to be a bad idea cheaply':
    'Το μέρος όπου μια κακή ιδέα προλαβαίνει να είναι κακή ιδέα φθηνά',

  /* ------------------------------ Bookshelf --------------------------- */
  'Not many books, and none of them here by accident. These are the ones I have gone back to. Verne is on the shelf across the room, where he has always been.':
    'Όχι πολλά βιβλία, και κανένα τους εδώ τυχαία. Αυτά είναι εκείνα στα οποία έχω επιστρέψει. Ο Βερν είναι στο ράφι απέναντι, εκεί που ήταν πάντα.',
  'The Gambler': 'Ο Παίκτης',
  'Fyodor Dostoevsky': 'Φιόντορ Ντοστογιέφσκι',
  'On wanting the wrong thing, clearly':
    'Για το να θέλεις καθαρά το λάθος πράγμα',
  'Les Misérables': 'Οι Άθλιοι',
  'Victor Hugo': 'Βίκτωρ Ουγκώ',
  'On mercy being a decision, not a feeling':
    'Για το ότι το έλεος είναι απόφαση, όχι συναίσθημα',
  'Surely You’re Joking, Mr. Feynman!': 'Σίγουρα Αστειεύεστε, κύριε Φάινμαν!',
  'Richard Feynman': 'Ρίτσαρντ Φάινμαν',
  'On refusing to be impressed': 'Για την άρνηση να εντυπωσιαστείς',
  'George Orwell': 'Τζορτζ Όργουελ',
  'On what language is for': 'Για το σε τι χρησιμεύει η γλώσσα',
  'All Quiet on the Western Front': 'Ουδέν Νεότερον από το Δυτικόν Μέτωπον',
  'Erich Maria Remarque': 'Έριχ Μαρία Ρεμάρκ',
  'On who is actually sent': 'Για το ποιος στέλνεται τελικά',
  'The Grapes of Wrath': 'Τα Σταφύλια της Οργής',
  'John Steinbeck': 'Τζον Στάινμπεκ',
  'On a family holding together': 'Για μια οικογένεια που κρατιέται μαζί',
  'These were first. Read as a boy in a house with five children in it, which meant reading in whatever chair was going and with the argument still running in the next room. I got very good at concentrating.':
    'Αυτά ήταν πρώτα. Διαβασμένα μικρός, σε σπίτι με πέντε παιδιά, που σήμαινε διάβασμα σε όποια καρέκλα έμενε ελεύθερη και με τον καβγά να συνεχίζεται στο διπλανό δωμάτιο. Έγινα πολύ καλός στη συγκέντρωση.',
  'Written to pay off a gambling debt, about a man ruined by gambling. Nobody has ever been more honest about their own worst habit.':
    'Γραμμένο για να ξοφλήσει ένα χαρτοπαικτικό χρέος, για έναν άνθρωπο που καταστράφηκε από τον τζόγο. Κανείς δεν υπήρξε ποτέ πιο ειλικρινής για τη χειρότερη συνήθειά του.',
  'A thousand pages to say that a man can be more than his record, and worth every one of them.':
    'Χίλιες σελίδες για να πει ότι ένας άνθρωπος μπορεί να είναι κάτι παραπάνω από το μητρώο του, και αξίζουν όλες τους.',
  'The engineer’s book on this shelf. Take the thing apart, ask the stupid question out loud, and never mistake the jargon for the understanding.':
    'Το βιβλίο του μηχανικού σε αυτό το ράφι. Λύσε το πράγμα σε κομμάτια, κάνε τη χαζή ερώτηση φωναχτά, και ποτέ μην μπερδέψεις την ορολογία με την κατανόηση.',
  'Read at the right age it is a thriller. Read again later it is a manual, and you start noticing the vocabulary.':
    'Διαβασμένο στη σωστή ηλικία είναι θρίλερ. Διαβασμένο ξανά αργότερα είναι εγχειρίδιο, και αρχίζεις να προσέχεις το λεξιλόγιο.',
  'I read this before my own service and again after it. It is a different book on the far side.':
    'Το διάβασα πριν από τη δική μου θητεία και ξανά μετά. Είναι άλλο βιβλίο από την άλλη μεριά.',
  'A big family on a bad road, keeping each other alive. It landed somewhere personal and it has stayed there.':
    'Μια μεγάλη οικογένεια σε έναν κακό δρόμο, που κρατάει ο ένας τον άλλο ζωντανό. Χτύπησε κάπου προσωπικά και εκεί έμεινε.',

  /* ----------------------------- Verne shelf -------------------------- */
  'Five Weeks in a Balloon': 'Πέντε Εβδομάδες σε Αερόστατο',
  'Jules Verne, 1863': 'Ιούλιος Βερν, 1863',
  'The first one he wrote, and the first one I read':
    'Το πρώτο που έγραψε, και το πρώτο που διάβασα',
  'Journey to the Centre of the Earth': 'Ταξίδι στο Κέντρο της Γης',
  'Jules Verne, 1864': 'Ιούλιος Βερν, 1864',
  'On going down to find out': 'Για το να κατεβαίνεις για να μάθεις',
  'Twenty Thousand Leagues Under the Sea':
    'Είκοσι Χιλιάδες Λεύγες Κάτω από τη Θάλασσα',
  'Jules Verne, 1870': 'Ιούλιος Βερν, 1870',
  'On building the thing nobody asked for':
    'Για το να φτιάχνεις αυτό που δεν ζήτησε κανείς',
  'The Mysterious Island': 'Το Μυστηριώδες Νησί',
  'Jules Verne, 1875': 'Ιούλιος Βερν, 1875',
  'The one that did the damage': 'Αυτό που έκανε τη ζημιά',
  'Dick Sand: A Captain at Fifteen':
    'Ντικ Σαντ: Ένας Δεκαπεντάχρονος Πλοίαρχος',
  'Jules Verne, 1878': 'Ιούλιος Βερν, 1878',
  'On being handed it early': 'Για το να σου το δίνουν νωρίς',
  'A Drama in Livonia': 'Ένα Δράμα στη Λιβονία',
  'Jules Verne, 1904': 'Ιούλιος Βερν, 1904',
  'The one with nothing to build': 'Αυτό όπου δεν υπάρχει τίποτα να χτιστεί',
  'Anything one man can imagine, other men can make real. He wrote that in 1873 and it has been quoted at every engineer since, and it is still true.':
    'Ό,τι μπορεί να φανταστεί ένας άνθρωπος, άλλοι άνθρωποι μπορούν να το κάνουν πραγματικότητα. Το έγραψε το 1873 και το λένε σε κάθε μηχανικό από τότε, και εξακολουθεί να ισχύει.',
  'Three men cross a continent in a balloon they cannot steer, on the theory that you can still choose your altitude. Which is most of engineering: you rarely get to pick the wind.':
    'Τρεις άντρες διασχίζουν μια ήπειρο με αερόστατο που δεν μπορούν να κατευθύνουν, με τη λογική ότι μπορείς πάντως να διαλέξεις το ύψος σου. Που είναι και το μεγαλύτερο μέρος της μηχανικής: σπάνια διαλέγεις τον άνεμο.',
  'A coded note, a volcano in Iceland, and an uncle who will not be argued out of it. The first book that made me want to know how something worked badly enough to climb into it.':
    'Ένα κρυπτογραφημένο σημείωμα, ένα ηφαίστειο στην Ισλανδία, και ένας θείος που δεν μεταπείθεται. Το πρώτο βιβλίο που με έκανε να θέλω να μάθω πώς δουλεύει κάτι τόσο πολύ ώστε να μπω μέσα του.',
  'The twenty thousand leagues are how far the Nautilus travels, not how deep she goes, which everybody gets wrong, and which is the sort of detail I have never been able to leave alone.':
    'Οι είκοσι χιλιάδες λεύγες είναι το πόσο ταξιδεύει το Ναυτίλος, όχι το πόσο βαθιά πάει, που όλοι το μπερδεύουν, και που είναι ακριβώς το είδος της λεπτομέρειας που ποτέ δεν μπόρεσα να αφήσω ήσυχη.',
  'Nemo is an engineer with a grievance and unlimited budget. I have met the type.':
    'Ο Νέμο είναι μηχανικός με παράπονο και απεριόριστο προϋπολογισμό. Έχω συναντήσει τον τύπο.',
  'Five men land on a rock with nothing and end up with brick, iron, glass, a telegraph and a boat. It is four hundred pages of working out what you can make from what is actually to hand.':
    'Πέντε άντρες ξεβράζονται σε έναν βράχο χωρίς τίποτα και καταλήγουν με τούβλο, σίδερο, γυαλί, τηλέγραφο και βάρκα. Είναι τετρακόσιες σελίδες υπολογισμού του τι μπορείς να φτιάξεις από ό,τι έχεις πραγματικά στα χέρια σου.',
  'If there is one book on either shelf that explains the workbench in this cellar, it is this one.':
    'Αν υπάρχει ένα βιβλίο σε οποιοδήποτε από τα δύο ράφια που εξηγεί τον πάγκο εργασίας σε αυτό το υπόγειο, είναι αυτό.',
  'A fifteen-year-old ends up in command because everybody senior is gone. He is not ready and he does it anyway.':
    'Ένας δεκαπεντάχρονος βρίσκεται στη διοίκηση επειδή όλοι οι ανώτεροι έχουν φύγει. Δεν είναι έτοιμος και το κάνει έτσι κι αλλιώς.',
  'Read at about that age, in a big family, where being handed something before you are ready is simply Tuesday.':
    'Διαβασμένο περίπου σε εκείνη την ηλικία, σε μια μεγάλη οικογένεια, όπου το να σου δίνουν κάτι πριν είσαι έτοιμος είναι απλώς μια συνηθισμένη Τρίτη.',
  'Late Verne, and the odd one out on this shelf: no balloon, no submarine, no island. A murder in the frozen Baltic, and a man convicted of it on circumstance while the reader knows perfectly well he did not do it.':
    'Ύστερος Βερν, και το παράταιρο του ραφιού: χωρίς αερόστατο, χωρίς υποβρύχιο, χωρίς νησί. Ένας φόνος στην παγωμένη Βαλτική, και ένας άνθρωπος που καταδικάζεται γι’ αυτόν από τις περιστάσεις ενώ ο αναγνώστης ξέρει πολύ καλά ότι δεν το έκανε.',
  'A Slav schoolmaster against the German merchant families who own the province, and a verdict that arrives long before the evidence does. It is really about how fast everyone agrees on the wrong answer when they already wanted to.':
    'Ένας Σλάβος δάσκαλος απέναντι στις γερμανικές εμπορικές οικογένειες που ορίζουν την επαρχία, και μια ετυμηγορία που φτάνει πολύ πριν από τα στοιχεία. Στην πραγματικότητα μιλάει για το πόσο γρήγορα συμφωνούν όλοι στη λάθος απάντηση όταν την ήθελαν ήδη.',
  'The only one here where nobody can engineer their way out. That is why I remember it.':
    'Το μόνο εδώ όπου κανείς δεν μπορεί να βγει με τη μηχανική. Γι’ αυτό το θυμάμαι.',

  /* ------------------------------ Playroom ---------------------------- */
  'Behind a shelf in the library. A television, a Switch docked under it, two beanbags and the posters I have never grown out of.':
    'Πίσω από ένα ράφι στη βιβλιοθήκη. Μια τηλεόραση, ένα Switch στη βάση του από κάτω, δύο πουφ και οι αφίσες που ποτέ δεν ξεπέρασα.',
  'Every house should have one room that is nobody’s business.':
    'Κάθε σπίτι πρέπει να έχει ένα δωμάτιο που δεν αφορά κανέναν.',
  'Mario, still, and no apology for it':
    'Ακόμη Mario, και καμία απολογία γι’ αυτό',
  'Star Wars, the whole thing, arguments about the ordering included':
    'Star Wars, όλο, μαζί με τους καβγάδες για τη σειρά',
  'The Marvel run, watched properly and in sequence like a serious person':
    'Όλο το Marvel, δει σωστά και με τη σειρά σαν σοβαρός άνθρωπος',
  'Clinical Research': 'Κλινική έρευνα',
  'Artificial Neural Networks': 'Τεχνητά νευρωνικά δίκτυα',
  'And anything well made: give me a good film and I will give you the evening':
    'Και οτιδήποτε καλοφτιαγμένο: δώσε μου μια καλή ταινία και σου δίνω το βράδυ',

  /* The globe in the corner of the Evangeliki classroom. The flags stay as
     they are: an emoji is the same in both languages. */
  'The globe in the corner': 'Η υδρόγειος στη γωνία',
  'Where the globe has been stopped': 'Πού έχει σταματήσει η υδρόγειος',
  'The astronomy corner had a globe, and a boy who spun it more than he studied it. Six of the countries on it he has since stood in.':
    'Η γωνιά της αστρονομίας είχε μια υδρόγειο, και ένα παιδί που την έστρεφε περισσότερο από όσο τη μελέτησε. Σε έξι από τις χώρες της έχει έκτοτε σταθεί.',
  Greece: 'Ελλάδα',
  Cyprus: 'Κύπρος',
  Germany: 'Γερμανία',
  France: 'Γαλλία',
  Italy: 'Ιταλία',
  Switzerland: 'Ελβετία',
}
