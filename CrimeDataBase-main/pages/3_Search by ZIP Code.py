import streamlit as st
import mysql.connector
import pandas as pd
import pydeck as pdk
import numpy as np
from datetime import datetime
import matplotlib.pyplot as plt
from geopy.geocoders import ArcGIS
import time
import random
import plotly.graph_objs as go

st.set_page_config(
    page_title='Houston Crime', 
    page_icon="📊",
    layout="wide", 
    initial_sidebar_state="expanded"
)
def get_lat_long(zipcode):
    geolocator = ArcGIS()
    location = geolocator.geocode(zipcode)
    if location:
        return location.latitude, location.longitude
    else:
        return None, None

def fetch_top_occurrences(year,zipcode):
    mycursor.execute(f"""

        SELECT REPLACE(`NIBRSDescription`, '"', '') AS 
        `NIBRSDescription`, COUNT(*) as num_occurrences
        FROM `houston_crime_data`.`{year}crimedata`
        WHERE `ZIPCode` = '{zipcode}'
        GROUP BY `NIBRSDescription`
        ORDER BY num_occurrences DESC
        LIMIT 10
    """)
    return mycursor.fetchall()


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
    st.title("Houston Crime Data Visualizer")
    st.subheader("Search by ZIP Code")
    option = st.sidebar.selectbox('Select a Year', ('2024','2023','2022', '2021', '2020'))
    with st.form("my_form"):
        zipcode = st.text_input('Enter the ZIP Code to search', '')
        submitted = st.form_submit_button('Search')
        # Random = st.form_submit_button('Randomize Year and ZIP Code')

    # Process user input when form is submitted
    if submitted:
        col1, col2 = st.columns(2)
        with col1:
            with st.spinner('loading map'):
                time.sleep(0)
                st.subheader(f"{option} Crime Data within the ZIP Code {zipcode}")
                mycursor.execute(f"""SELECT `Incident`, `RMSOccurrenceDate`, `RMSOccurrenceHour`, 
                    `NIBRSClass`, `NIBRSDescription`, `OffenseCount`, `Beat`, `Premise`, 
                    `StreetNo`, `StreetName`, `StreetType`, `Suffix`, `City`, `ZIPCode`, 
                    `MapLongitude`, `MapLatitude` FROM `houston_crime_data`.`{option}crimedata` 
                    WHERE `ZIPCode` = '{zipcode}';""")
                result = mycursor.fetchall()

                # Extract latitude and longitude for visualization
                coord = [[row["MapLatitude"], row["MapLongitude"]] for row in result]
                chart_data = pd.DataFrame(coord, columns=['lat', 'lon'])
                latitude, longitude = get_lat_long(zipcode)
                

                # Display crime data on a map
                st.pydeck_chart(pdk.Deck(
                    map_style=None,
                    initial_view_state=pdk.ViewState(latitude=latitude, longitude=longitude, zoom=13, pitch=50),
                    layers=[
                        pdk.Layer(
                            'HexagonLayer',
                            data=chart_data,
                            get_position='[lon, lat]',
                            radius=30,
                            elevation_scale=1,
                            elevation_range=[0, 1000],
                            pickable=True,
                            extruded=True,
                        ),
                    ],
                ))

        with col2:

            top_ten_occurrences = fetch_top_occurrences(option, zipcode)

            labels = []
            sizes = []
            for item in top_ten_occurrences:
                labels.append(item['NIBRSDescription'])  # Extract 'NIBRSDescription' value
                sizes.append(item['num_occurrences'])   # Extract 'num_occurrences' value

            # Plot Donut chart
            fig = go.Figure(data=[go.Pie(labels=labels, values=sizes, hole=0.4)])

            fig.update_layout(
                title=f'Top Ten Crime Occurrences ({option}) within the ZIP Code {zipcode}',
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
        with st.container(border=True):
            mycursor.execute(f"""
                SELECT RMSOccurrenceDate, RMSOccurrenceHour, REPLACE(`NIBRSDescription`, '"', '') AS 
                `NIBRSDescription`,     REPLACE(`Premise`, '"', '') AS `Premise`, StreetNo,
                StreetName, StreetType, City, ZIPCode, MapLongitude, MapLatitude
                FROM `houston_crime_data`.`{option}crimedata`
                WHERE `ZIPCode` = '{zipcode}'
            """)

            occurrences_details = mycursor.fetchall()

            mycursor.execute(f"""
                SELECT COUNT(*) AS total_occurrences
                FROM `houston_crime_data`.`{option}crimedata`
                WHERE `ZIPCode` = '{zipcode}';
            """)
            occurrences_number = mycursor.fetchall()
            # Display a table with all the details of occurrences
            st.title("All Occurrences")
            st.subheader(f"Number of Crimes: {occurrences_number[0]['total_occurrences']}")
            st.write(f"Below is a table displaying all details of crime occurrences ({option}) in ZIP code {zipcode}:")
            occurrences_table = pd.DataFrame(occurrences_details)
            # Convert ZIP code to a string without commas and ensure ZIP codes beginning with '0' are displayed correctly
            occurrences_table['ZIPCode'] = occurrences_table['ZIPCode'].apply(lambda x: "'{:05d}".format(int(x)))

            # Convert RMSOccurrenceHour to actual time format (assuming it is in 24-hour format)
            occurrences_table['RMSOccurrenceHour'] = occurrences_table['RMSOccurrenceHour'].apply(lambda x: datetime.strptime(str(x), '%H').strftime('%I:%M %p'))
            st.write(occurrences_table)


    #Will implement this feature later
    # elif Random:
        
    #     with st.spinner('loading map'):
    #         years = ["2024","2023","2022", "2021", "2020"]
    #         year = random.choice(years)
    #         mycursor.execute(f"SELECT ZIPCode FROM {year}crimedata WHERE ZIPCode != 0 ORDER BY RAND() LIMIT 1")
    #         zipcode_dict = mycursor.fetchone()
    #         zipcode = random.choice(list(zipcode_dict.values()))
            



    #         time.sleep(0)
    #         st.subheader(f"Crime Data for the year of {year} and the ZIP code {zipcode}")
    #         mycursor.execute(f"""SELECT `Incident`, `RMSOccurrenceDate`, `RMSOccurrenceHour`, 
    #             `NIBRSClass`, `NIBRSDescription`, `OffenseCount`, `Beat`, `Premise`, 
    #             `StreetNo`, `StreetName`, `StreetType`, `Suffix`, `City`, `ZIPCode`, 
    #             `MapLongitude`, `MapLatitude` FROM `houston_crime_data`.`{year}crimedata` 
    #             WHERE `ZIPCode` = '{zipcode}';""")
    #         result = mycursor.fetchall()

    #         # Extract latitude and longitude for visualization
    #         coord = [[row["MapLatitude"], row["MapLongitude"]] for row in result]
    #         chart_data = pd.DataFrame(coord, columns=['lat', 'lon'])
    #         latitude, longitude = get_lat_long(zipcode)
            
    #         # Display crime data on a map
    #         st.pydeck_chart(pdk.Deck(
    #             map_style=None,
    #             initial_view_state=pdk.ViewState(latitude=latitude, longitude=longitude, zoom=13, pitch=50),
    #             layers=[
    #                 pdk.Layer(
    #                     'HexagonLayer',
    #                     data=chart_data,
    #                     get_position='[lon, lat]',
    #                     radius=30,
    #                     elevation_scale=1,
    #                     elevation_range=[0, 1000],
    #                     pickable=False,
    #                     extruded=True,
    #                 ),
    #             ],
    #         ))

    #         # Fetch top ten occurrences
    #         mycursor.execute(f"""
    #             SELECT `NIBRSDescription`, COUNT(*) as num_occurrences
    #             FROM `houston_crime_data`.`{year}crimedata`
    #             WHERE `ZIPCode` = '{zipcode}'
    #             GROUP BY `NIBRSDescription`
    #             ORDER BY num_occurrences DESC
    #             LIMIT 10
    #         """)
    #         top_ten_occurrences = mycursor.fetchall()

    #         labels = []
    #         sizes = []

    #         for item in top_ten_occurrences:
    #             labels.append(item['NIBRSDescription'])  # Extract 'NIBRSDescription' value
    #             sizes.append(item['num_occurrences'])   # Extract 'num_occurrences' value

    #         # Plot pie chart
    #         fig1, ax1 = plt.subplots()
    #         wedges, texts, autotexts = ax1.pie(sizes, labels=None, autopct='%1.1f%%', shadow=True, startangle=90)

    #         ax1.pie(sizes, labels=None, autopct='%1.1f%%', shadow=True, startangle=90)
    #         ax1.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle.
    #         ax1.set_title(f'Top Ten Crime Occurrences ({year}) in ZIP Code {zipcode}')  # Adding title to the pie chart

    #         # Add legend
    #         ax1.legend(wedges, labels, title="Crime Types", loc="center left", bbox_to_anchor=(1, 0.5), title_fontsize="large", fontsize="medium")

    #         st.pyplot(fig1)

    #         mycursor.execute(f"""
    #             SELECT *
    #             FROM `houston_crime_data`.`{year}crimedata`
    #             WHERE `ZIPCode` = '{zipcode}'
    #         """)
    #         occurrences_details = mycursor.fetchall()

    #         # Display a table with all the details of occurrences
    #         st.subheader("All Occurrences")
    #         st.write(f"Below is a table displaying all details of crime occurrences ({year}) in ZIP code {zipcode}:")
    #         occurrences_table = pd.DataFrame(occurrences_details)
    #         st.write(occurrences_table)

    #--------------------------------------------------------------------------------------------------------------

if __name__=="__main__":
    main()
