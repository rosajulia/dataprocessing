#!/usr/bin/env python
# Name: Julia Jelgerhuis
# Student number: 10725482
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

import re

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)

    Library 're' was used to recompile names from the href list from actors
    First, all information about a single tv-serie was added to the list
    series_one. After all information was obtained, the series_one list was
    added to the series_all list.
    """
    # create empty list for all series
    series_all = []

    # loop over all series
    for content in dom.find_all("div", class_="lister-item-content"):

        # create list per serie
        series_one = []

        # get titles
        title = content.h3.a.text
        # fail check
        if not title:
            print("Not available")
        else:
            series_one.append(title)

        # get rating
        rating = content.find("div", class_="inline-block ratings-imdb-rating").strong.text
        # fail check
        if not rating:
            print("Not available")
        else:
            series_one.append(rating)

        # get genre
        genre = content.find("span", class_="genre").text
        # fail check
        if not genre:
            print("Not available")
        else:
            series_one.append(genre.strip())

        # get actors
        actors = content.find_all("a", href=re.compile("^(/name/)"))

        # create list for actors
        actor_list = []

        # iterate over actors and append to

        for i in range(len(actors)):
            actor_list.append(actors[i].text)

        # join actors as string
        s = ", "
        actors_str = s.join(actor_list)

        # add actors to list
        series_one.append(actors_str)

        # get runtime
        runtime = content.find("span", class_ = "runtime").text
        # fail check
        if not runtime:
            print("Not available")
        else:
            # remove 'min' to get only ints
            series_one.append(runtime.strip(' min'))

        # add series one to all series
        series_all.append(series_one)

    # return list with all series
    return series_all


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """

    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    # add rows to outputfile
    for rows in tvseries:
        writer.writerow(rows)

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as output_file:
        save_csv(output_file, tvseries)
