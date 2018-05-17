''' 

Julia Jelgerhuis
Minor Programmeren - Dataprocessing
Homework week 6 - Linked Views

This python file loads the csv dataset in, and converts it to a 
json file called vacdata.json.

'''
import csv
import json

# open CSV file as dict
with open("data/vacdata.csv") as file_vacData:
    reader = csv.DictReader(file_vacData)
    data = json.dumps([row for row in reader])

# write dict to JSON
json_file = open("vacdata.json", "w")
json_file.write(data)
