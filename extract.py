import pdb
from urllib.request import urlopen
import postgresql.driver as pg_driver
from bs4 import BeautifulSoup
from dateutil.parser import parse
from datetime import datetime
from elasticsearch import Elasticsearch

# Ex: search.search(index='events', q='poet')
# Ex: search.get(index='events', doc_type='event', id=99)

search = Elasticsearch([{'host': '192.168.99.100', 'port': 9200}])
db = pg_driver.connect(
  user = 'postgres',
  password = 'postgres',
  host = 'localhost',
  port = '5432',
  database = "worldhistory"
)

def createTables(db):
  db.execute("DROP TABLE IF EXISTS timelines;")
  db.execute("CREATE TABLE timelines (event_date VARCHAR(64), id INTEGER, event_description VARCHAR(2048));")

# If date represents an invalid date then None is returned
def getDateKey(date):
  try:
    dateObj = parse(date)
    return dateObj.isoformat()
  except TypeError:
    return None
  except ValueError:
    return None

def parseYearWiki(year, timeline):
  u = "https://en.wikipedia.org/wiki/" + year

  print("Reading from " + u)
  page = urlopen(u)
  soup = BeautifulSoup(page.read(), "html.parser")
  content = soup.find(id="mw-content-text")

  h2 = content.find('h2')
  uls = h2.find_next_siblings('ul')
  get_li = lambda x: x.find_all('li', recursive=False)
  flatten = lambda z: [x for y in z for x in y]
  events = flatten( map(get_li, uls) )
  for e in events:
    txt = e.get_text()
    # Find the category that this event belongs to
    category_name = e.find_previous('h2').span.text

    if (txt.find(u'\u2013') > -1):
      hyphenIdx = txt.index(u'\u2013')
      date = txt[:hyphenIdx]
      eventDesc = txt[hyphenIdx:]

      key = getDateKey(date + ", " + year)
      if (key != None):
        timeline[key] = [(category_name + ": " + eventDesc)]
    else:
      evnts = [x for x in txt.split("\n") if x != '']
      if (len(evnts) > 0):
        date = evnts[0]
        evnts = evnts[1:]

        key = getDateKey(date + ", " + year)
        if (key != None):
          timeline[key] = []
          for e2 in evnts:
            timeline[key].append( (category_name + ": " + e2) )

#=============================================================================
timeline = dict()

createTables(db)

for y in range(1700, 1900):
  print("Parsing Wiki page for year " + str(y) + "...")
  parseYearWiki(str(y), timeline)

print("Persisting events to data store.")
# Get the geolocation of each event. Make a query for each geolocation against the index...

searchIndex = 1
for date in timeline:
  for desc in timeline[date]:
    search.index(index='events', id=searchIndex, doc_type='event', body={'date': date, 'description': desc.replace("'", "")})
    searchIndex += 1
    stmt = "INSERT INTO timelines (event_date, event_description) VALUES ('" + date + "', '" + desc.replace("'", "") + "');"
    db.execute(stmt)

print(timeline.keys())
