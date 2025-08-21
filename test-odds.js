const axios = require('axios');

async function testOdds() {
  try {
    const response = await axios.get('http://localhost:3001/api/odds?bm=bet365');
    const categories = response.data?.data?.scores?.category || [];
    
    console.log('Total categories:', categories.length);
    
    let totalMatches = 0;
    let matchesWithOdds = 0;
    
    categories.forEach((category, catIndex) => {
      const categoryMatches = category.matches?.match;
      if (categoryMatches) {
        const matchArray = Array.isArray(categoryMatches) ? categoryMatches : [categoryMatches];
        totalMatches += matchArray.length;
        
        matchArray.forEach((match, matchIndex) => {
          if (match.odds?.type) {
            matchesWithOdds++;
            console.log(`\nMatch ${match.id} in category ${category.name}:`);
            console.log('Odds types available:', match.odds.type.length);
            
            match.odds.type.forEach((oddsType, typeIndex) => {
              console.log(`  Type ${typeIndex}: ${oddsType.value}`);
              if (oddsType.bookmaker) {
                const bookmakers = Array.isArray(oddsType.bookmaker) ? oddsType.bookmaker : [oddsType.bookmaker];
                bookmakers.forEach((bm, bmIndex) => {
                  console.log(`    Bookmaker ${bmIndex}: ${bm.name}`);
                  if (bm.odd) {
                    const odds = Array.isArray(bm.odd) ? bm.odd : [bm.odd];
                    odds.forEach((odd, oddIndex) => {
                      console.log(`      ${odd.name}: ${odd.value}`);
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    
    console.log(`\nSummary:`);
    console.log(`Total matches: ${totalMatches}`);
    console.log(`Matches with odds: ${matchesWithOdds}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOdds();