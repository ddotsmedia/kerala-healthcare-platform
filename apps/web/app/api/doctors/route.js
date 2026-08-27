export async function GET(req) {
  const doctors = [
    { id: '1', name: 'Dr. Rajesh Kumar', specialty: 'General Practice', experience: 10, rating: 4.8, consultationFee: 500, languages: ['English', 'Malayalam'] },
    { id: '2', name: 'Dr. Priya Sharma', specialty: 'Cardiology', experience: 15, rating: 4.9, consultationFee: 800, languages: ['English', 'Hindi'] }
  ]
  return Response.json(doctors)
}
