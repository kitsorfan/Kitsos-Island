/**
 * Greek for the certificate checker at /verify, and for nothing else.
 *
 * Kept out of the island's dictionary on purpose. The checker loads on its
 * own, with no island behind it, so it fetches these forty lines rather than
 * the whole of the Greek — and its words mean something else here: a
 * "Reference" on this page is the code along the bottom of a certificate,
 * where on the island it is a letter of recommendation, and "Check" is a
 * button rather than a look at the calendar.
 */
export const VERIFY: Record<string, string> = {
  'Verify a certificate · Kitsos Island':
    'Έλεγχος πιστοποιητικού · Το Νησί του Κίτσου',
  'Kitsos Island · Certificate check':
    'Το Νησί του Κίτσου · Έλεγχος πιστοποιητικού',

  'Check a certificate': 'Έλεγξε ένα πιστοποιητικό',
  'Enter the reference printed along the bottom of the certificate, and the name on it.':
    'Γράψε τον κωδικό που είναι τυπωμένος στο κάτω μέρος του πιστοποιητικού, και το όνομα που γράφει.',
  'Certificate verified': 'Το πιστοποιητικό είναι γνήσιο',
  'This certificate was issued by Kitsos Island to {name}, for walking every road of the island and leaving it by rocket.':
    'Το πιστοποιητικό εκδόθηκε από το Νησί του Κίτσου στο όνομα «{name}», για κάποιον που περπάτησε κάθε δρόμο του νησιού και έφυγε από αυτό με πύραυλο.',
  'Reference verified': 'Ο κωδικός είναι γνήσιος',
  'The reference is genuine. It dates from before names were signed into certificates, so it cannot confirm that it was issued to {name} in particular.':
    'Ο κωδικός είναι γνήσιος. Είναι από την εποχή πριν μπουν τα ονόματα στην υπογραφή των πιστοποιητικών, οπότε δεν μπορεί να επιβεβαιώσει ότι εκδόθηκε ειδικά στο όνομα «{name}».',
  'The reference is genuine. It dates from before names were signed into certificates, so it does not say who it was issued to.':
    'Ο κωδικός είναι γνήσιος. Είναι από την εποχή πριν μπουν τα ονόματα στην υπογραφή των πιστοποιητικών, οπότε δεν λέει σε ποιον εκδόθηκε.',
  'Not verified': 'Δεν επαληθεύτηκε',
  'This reference was not issued to {name}. Check the name is spelled as it is on the certificate, and the reference is typed exactly.':
    'Αυτός ο κωδικός δεν εκδόθηκε στο όνομα «{name}». Έλεγξε ότι το όνομα είναι γραμμένο όπως στο πιστοποιητικό και ότι ο κωδικός είναι σωστός.',
  'Name needed': 'Χρειάζεται όνομα',
  'Certificates are signed for the name on them. Enter that name to check this one.':
    'Κάθε πιστοποιητικό υπογράφεται για το όνομα που γράφει. Γράψε αυτό το όνομα για να το ελέγξεις.',
  'That is not a Kitsos Island certificate reference. They look like KI-0ABCD-1EFGH.':
    'Αυτός δεν είναι κωδικός πιστοποιητικού από το Νησί του Κίτσου. Μοιάζουν κάπως έτσι: KI-0ABCD-1EFGH.',

  Name: 'Όνομα',
  Reference: 'Κωδικός',
  'Issued for': 'Εκδόθηκε για',
  'Completing Kitsos Island': 'Την ολοκλήρωση του Νησιού του Κίτσου',
  'Name on the certificate': 'Το όνομα στο πιστοποιητικό',
  Check: 'Έλεγχος',
  'The reference is signed with RSA, and the signature covers the name. The key is deliberately tiny and ships with the site, so this shows how verification works rather than proving much: it is a souvenir, checked honestly.':
    'Ο κωδικός είναι υπογεγραμμένος με RSA, και η υπογραφή καλύπτει και το όνομα. Το κλειδί είναι επίτηδες μικροσκοπικό και έρχεται μαζί με τη σελίδα, οπότε αυτό δείχνει πώς δουλεύει η επαλήθευση περισσότερο παρά αποδεικνύει κάτι: είναι ένα σουβενίρ, που ελέγχεται τίμια.',
  'Visit the island →': 'Επισκέψου το νησί →',
}
