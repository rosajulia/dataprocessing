import csv
import json

# open CSV file as dict
with open("donor_data.csv") as file_donor:
    reader = csv.DictReader(file_donor)
    donor_data = json.dumps([row for row in reader])
    print(donor_data)

# write dict to JSON
json_file = open("donor_data.json", 'w')
json_file.write(donor_data)