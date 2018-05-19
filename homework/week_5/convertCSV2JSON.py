''' 

Julia Jelgerhuis
Minor Programmeren - Dataprocessing
Homework week 6 - Linked Views

This python file loads the csv dataset in, and converts it to a 
json file called vacdata.json.

'''
import csv
import json
import sys

if len(sys.argv) != 2:
        print("Usage: python convertCSV2JSON csv_file")
        sys.exit(1)
    
print(sys.argv[1])

# open CSV file as dict
with open(sys.argv[1]) as file_vacData:
    reader = csv.DictReader(file_vacData)
    data = json.dumps([row for row in reader])

# write dict to JSON
json_file = open("data.json", "w")
json_file.write(data)
