export async function GET(req) {
  const hospitals = [
    { id: '1', name: 'Apollo Hospital', city: 'Kochi', type: 'multi_specialty', totalBeds: 500, rating: 4.7, nabhAccredited: true, departments: ['Cardiology', 'Surgery'] },
    { id: '2', name: 'Medanta', city: 'Ernakulam', type: 'multi_specialty', totalBeds: 400, rating: 4.6, aaciAccredited: true, departments: ['Neurology', 'Orthopedics'] }
  ]
  return Response.json(hospitals)
}
