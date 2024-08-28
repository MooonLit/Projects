import streamlit as st
import mysql.connector
import pandas as pd
import pydeck as pdk
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
from geopy.geocoders import ArcGIS
import time
import plotly.graph_objs as go
import math



st.set_page_config(
    page_title='Houston Crime', 
    page_icon="📊",
    layout="wide", 
    initial_sidebar_state="expanded"
)


def get_day_of_week(date_string):
        # Parse the date string into a datetime object
        date = datetime.strptime(date_string, "%m/%d/%Y")  # Adjust the date format as needed
        # Get the day of the week
        return date.strftime("%A")

def crimes_by_day_of_the_week(year, address, radius,sql_query):
    lat, lon = get_coordinates(address)
    if lat is None or lon is None:
        return []
    mycursor.execute(f"""SELECT RMSOccurrenceDate FROM `houston_crime_data`.`{year}crimedata`
        WHERE SQRT(POW(MapLatitude - {lat}, 2) + POW(MapLongitude - {lon}, 2)) * 111.12 <= {radius}
        AND ({sql_query});""")  # Replace `your_table` with your actual table name
    # Fetch all results
    results = mycursor.fetchall()
    dayofthecrime = {'Sunday':0, 'Monday':0, 'Tuesday':0, 'Wednesday':0, 'Thursday':0, 'Friday':0, 'Saturday':0,}
    # Convert the results to a list of day names, skipping None values

    for date in results:

        day = get_day_of_week(date['RMSOccurrenceDate'])
        if day in dayofthecrime:
            dayofthecrime[day] += 1

    # Count occurrences of each day

    # Ensure all days are represented, even if they have zero occurrences
    all_days = ['Saturday', 'Friday', 'Thursday', 'Wednesday', 'Tuesday', 'Monday', 'Sunday']


    # Create a horizontal bar chart
    fig = go.Figure(go.Bar(
        x=[dayofthecrime['Saturday'], dayofthecrime['Friday'], dayofthecrime['Thursday'], dayofthecrime['Wednesday'], dayofthecrime['Tuesday'], dayofthecrime['Monday'], dayofthecrime['Sunday']],
        y=all_days,
        orientation='h',
        marker=dict(color='rgb(0, 102, 204)'),
        hovertemplate='Day: %{y}<br>Crimes: %{x}<extra></extra>',
        text=[dayofthecrime['Saturday'], dayofthecrime['Friday'], dayofthecrime['Thursday'], dayofthecrime['Wednesday'], dayofthecrime['Tuesday'], dayofthecrime['Monday'], dayofthecrime['Sunday']], # Add text to show crime count
        textposition='outside' # Show text outside the bars
    ))

    # Update layout to add axis titles and adjust size
    fig.update_layout(
        xaxis_title='Number of Crimes',
        yaxis_title='Days of the Week',
        title='Crimes by Days of the Week',
        font=dict(size=14),  # Reduce font size to fit better
        title_font_size=20,
        width=800,  # Set the width of the chart
        height=600   # Set the height of the chart
    )

    st.plotly_chart(fig, use_container_width=True)


def get_coordinates(address):
    geolocator = ArcGIS()
    location = geolocator.geocode(address + ", Houston, TX")
    if location:
        latitude = location.latitude
        longitude = location.longitude
        return latitude, longitude
    else:
        return None

def get_lat_long(zipcode):
    geolocator = ArcGIS()
    location = geolocator.geocode(zipcode)
    if location:
        return location.latitude, location.longitude
    else:
        return None, None

def haversine(lat1, lon1, lat2, lon2):
    radius = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = radius * c
    return distance

def fetch_crime_within_radius(year, address, radius,sql_query):
    lat, lon = get_coordinates(address)
    if lat is None or lon is None:
        return []

    mycursor.execute(f"""
        SELECT MapLatitude, MapLongitude, `NIBRSDescription`
        FROM `houston_crime_data`.`{year}crimedata`
        WHERE SQRT(POW(MapLatitude - {lat}, 2) + POW(MapLongitude - {lon}, 2)) * 111.12 <= {radius}
        AND ({sql_query});
    """)
    return mycursor.fetchall()

def fetch_top_occurrences(year, address, radius, sql_query):
    lat, lon = get_coordinates(address)
    if lat is None or lon is None:
        return []

    mycursor.execute(f"""
        SELECT REPLACE(`NIBRSDescription`, '"', '') AS `NIBRSDescription`, COUNT(*) as num_occurrences
        FROM `houston_crime_data`.`{year}crimedata`
        WHERE SQRT(POW(MapLatitude - {lat}, 2) + POW(MapLongitude - {lon}, 2)) * 111.12 <= {radius}
        AND ({sql_query})
        GROUP BY `NIBRSDescription`
        ORDER BY num_occurrences DESC
        LIMIT 10
    """)
    return mycursor.fetchall()

def top_ten_donut_chart(option, street_name_and_num, radius, sql_query):
                top_ten_occurrences = fetch_top_occurrences(option, street_name_and_num, radius, sql_query)

                labels = []
                sizes = []
                for item in top_ten_occurrences:
                    labels.append(item['NIBRSDescription'])  # Extract 'NIBRSDescription' value
                    sizes.append(item['num_occurrences'])   # Extract 'num_occurrences' value

                # Plot Donut chart
                fig = go.Figure(data=[go.Pie(labels=labels, values=sizes, hole=0.4)])

                fig.update_layout(
                    title=f'Top Ten Crime Occurrences ({option}) within {radius} miles of {street_name_and_num}',
                    font=dict(size=20),
                    title_font_size=21
                )

                # Set chart size
                fig.update_layout(
                    width=800,  # Set width of the chart
                    height=600,  # Set height of the chart
                    showlegend=True,
                    legend=dict(x=0.9, y=0.5) # adjust legend position
                )

                st.plotly_chart(fig, use_container_width=True)


mydb = mysql.connector.connect(
    host=st.secrets["host"],
    user=st.secrets["user"],
    password=st.secrets["password"],
    database=st.secrets["database"],
    port=st.secrets["port"]
)

mycursor = mydb.cursor(dictionary=True)
print("Connection Esatblished")

def main():
    crimes = []

    st.title("Houston Crime Data Visualizer")
    st.subheader("Detailed Search")
    option = st.sidebar.selectbox('Select a Year', ('2024','2023','2022', '2021', '2020'))
    radius = st.sidebar.slider('Distance from Address (in miles) ', 1, 40, 5)
    mycursor.execute(f"""SELECT DISTINCT Cleaned_NIBRdescription
                     FROM (SELECT REPLACE(NIBRSDescription, '"', '') AS Cleaned_NIBRdescription 
                     FROM {option}crimedata
                     ) AS subquery_alias;""")
    result = mycursor.fetchall()
    for row in result:
        crimes.append(row["Cleaned_NIBRdescription"])
    options = st.sidebar.multiselect(
        'Crimes (You must select one crime type)',
        crimes)
    graph_type = st.sidebar.selectbox('Select a Chart to View', ('Top Ten Occurrences', 'Crimes by Days of the Week'))

    
    with st.form("my_form"):
        st.write("Detailed Search")
        street_name_and_num = st.text_input('Enter a Street Number, Street Name and Street Type (Ex. 3815 Westheimer Rd)', '')
        submitted = st.form_submit_button('Search')
    latitude = None
    longitude = None
    
    if not options:
        st.warning("Choose Crime Type(s)")# Process user input when form is submitted
    elif submitted:
        keyword_conditions = " OR ".join([f"NIBRSDescription LIKE '{keyword}'" for keyword in options])
        sql_query = f"{keyword_conditions}"

        col1, col2 = st.columns(2)
        with col1:
            with st.spinner(f"Loading {option} Crime Data within {radius} miles of {street_name_and_num}"):
                time.sleep(0)
                st.subheader(f"{option} Crime Data within {radius} miles of {street_name_and_num}")
                mycursor.execute(f"""SELECT `Incident`, `RMSOccurrenceDate`, `RMSOccurrenceHour`, 
                    `NIBRSClass`, `NIBRSDescription`, `OffenseCount`, `Beat`, `Premise`, 
                    `StreetNo`, `StreetName`, `StreetType`, `Suffix`, `City`, `ZIPCode`, 
                    `MapLongitude`, `MapLatitude` FROM `houston_crime_data`.`{option}crimedata`;""")
                result = mycursor.fetchall()

                # Extract latitude and longitude for visualization
                coord = [[row["MapLatitude"], row["MapLongitude"]] for row in result]
                chart_data = pd.DataFrame(coord, columns=['lat', 'lon'])
                latitude, longitude = get_coordinates(street_name_and_num)

                # Display crime data within radius on the map
                # Specify radius in kilometers
                crime_within_radius = fetch_crime_within_radius(option, street_name_and_num, radius,sql_query)

                # Display crime data within radius on the map
                coord_within_radius = [[row["MapLatitude"], row["MapLongitude"]] for row in crime_within_radius]
                chart_data_within_radius = pd.DataFrame(coord_within_radius, columns=['lat', 'lon'])

                st.pydeck_chart(pdk.Deck(
                    map_style=None,
                    initial_view_state=pdk.ViewState(latitude=latitude, longitude=longitude, zoom=13, pitch=50),
                    layers=[
                        pdk.Layer(
                            'HexagonLayer',
                            data=chart_data_within_radius,
                            get_position='[lon, lat]',
                            radius=30,
                            elevation_scale=1,
                            elevation_range=[0, 1000],
                            pickable=False,
                            extruded=True,
                        ),
                    ],
                ))
        with col2:
             if graph_type == 'Top Ten Occurrences':
                  top_ten_donut_chart(option, street_name_and_num, radius, sql_query)
             elif graph_type == 'Crimes by Days of the Week':
                    crimes_by_day_of_the_week(option, street_name_and_num, radius, sql_query)
                  
        with st.container(border=True):
            mycursor.execute(f"""
                SELECT RMSOccurrenceDate, RMSOccurrenceHour, REPLACE(`NIBRSDescription`, '"', '') AS 
                `NIBRSDescription`, REPLACE(`Premise`, '"', '') AS `Premise`, StreetNo,
                StreetName, StreetType, City, ZIPCode, MapLongitude, MapLatitude
                FROM `houston_crime_data`.`{option}crimedata`
                WHERE SQRT(POW(MapLatitude - {latitude}, 2) + POW(MapLongitude - {longitude}, 2)) * 111.12 <= {radius}
                AND ({sql_query});
            """)

            occurrences_details = mycursor.fetchall()
            mycursor.execute(f"""
                SELECT COUNT(*) AS total_occurrences
                FROM `houston_crime_data`.`{option}crimedata`
                WHERE SQRT(POW(MapLatitude - {latitude}, 2) + POW(MapLongitude - {longitude}, 2)) * 111.12 <= {radius}
                AND ({sql_query});
            """)
            occurrences_number = mycursor.fetchall()

            # Display a table with all the details of occurrences
            st.title("All Crime Occurrences")
            st.subheader(f"Number of Crimes: {occurrences_number[0]['total_occurrences']}")
            st.write(f"Below is a table displaying all details of crime occurrences ({option}) near {street_name_and_num}:")
            occurrences_table = pd.DataFrame(occurrences_details, index=None)  # Set index parameter to None
            # Convert RMSOccurrenceHour to actual time format (assuming it is in 24-hour format)
            occurrences_table['RMSOccurrenceHour'] = occurrences_table['RMSOccurrenceHour'].apply(lambda x: datetime.strptime(str(x), '%H').strftime('%I:%M %p'))
            st.write(occurrences_table)

    #--------------------------------------------------------------------------------------------------------------

if __name__=="__main__":
    main()
