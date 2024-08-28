import streamlit as st
import mysql.connector
import pandas as pd
import pydeck as pdk
import matplotlib.pyplot as plt
import plotly.graph_objs as go
import plotly.express as px
from datetime import datetime
from collections import Counter


st.set_page_config(
    page_title='Houston Crime', 
    page_icon="📊",
    layout="wide", 
    initial_sidebar_state="expanded"
)
# Establish database connection
mydb = mysql.connector.connect(
    host=st.secrets["host"],
    user=st.secrets["user"],
    password=st.secrets["password"],
    database=st.secrets["database"],
    port=st.secrets["port"]
)

mycursor = mydb.cursor(dictionary=True)

# Function to fetch crime data for a given year
def fetch_crime_data(year):
    query = f"""
        SELECT MapLatitude, MapLongitude
        FROM houston_crime_data.{year}crimedata
    """
    mycursor.execute(query)
    result = mycursor.fetchall()
    coord = [[row["MapLatitude"], row["MapLongitude"]] for row in result]
    return pd.DataFrame(coord, columns=['lat', 'lon'])

# Function to fetch top ten crime occurrences for a given year
def fetch_top_occurrences(year):
    query = f"""
        SELECT REPLACE(NIBRSDescription, '"', '') AS NIBRSDescription, COUNT(*) as num_occurrences
        FROM houston_crime_data.{year}crimedata
        GROUP BY NIBRSDescription
        ORDER BY num_occurrences DESC
        LIMIT 10
    """
    mycursor.execute(query)
    return mycursor.fetchall()

def plot_top_occurrences(option):
    # Fetch top ten occurrences
    top_ten_occurrences = fetch_top_occurrences(option)
    labels = [item['NIBRSDescription'] for item in top_ten_occurrences]
    sizes = [item['num_occurrences'] for item in top_ten_occurrences]

    fig = go.Figure(data=[go.Pie(labels=labels, values=sizes, hole=0.4)])

                # Set chart size
    fig.update_layout(
        width=800,  # Set width of the chart
        height=600,  # Set height of the chart
        showlegend=True,
        legend=dict(x=0.9, y=0.5) # adjust legend position
    )

    fig.update_layout(
        title=f'Top Ten Crime Occurrences ({option})',
        font=dict(size=20),
        title_font_size=21,
        showlegend=True,
        legend=dict(x=0.9, y=0.5) # Adjust legend position
    )

    # Display the pie chart in Streamlit
    return st.plotly_chart(fig, use_container_width=True)

def fetch_crime_counts_by_year():
    crime_counts = {}
    years = ['2020', '2021', '2022', '2023', '2024']
    for year in years:
        mycursor.execute(f"""SELECT COUNT(*) as num_crimes FROM `houston_crime_data`.`{year}crimedata`;""")
        result = mycursor.fetchone()
        crime_counts[year] = result['num_crimes']
    return crime_counts

def plot_crime_counts(crime_counts):
    years = list(crime_counts.keys())
    counts = list(crime_counts.values())

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(years, counts, marker='o', linestyle='-')
    years = ['2020', '2021', '2022', '2023', '2024']

    ax.set_title(f'Number of Crimes in Harris County, Texas ({years[0]}-{years[-2]}) Excluding {years[-1]}')
    ax.set_xlabel('Year')
    ax.set_ylabel('Number of Crimes')
    ax.grid(True)
    ax.set_xticks(years)  # Ensure all years are displayed on x-axis
    st.pyplot(fig)
def get_day_of_week(date_string):
        # Parse the date string into a datetime object
        date = datetime.strptime(date_string, "%m/%d/%Y")  # Adjust the date format as needed
        # Get the day of the week
        return date.strftime("%A")

def crimes_by_day_of_the_week(year):
    mycursor.execute(f"""SELECT RMSOccurrenceDate FROM `houston_crime_data`.`{year}crimedata`""")  # Replace `your_table` with your actual table name
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

def main():
    st.title("Houston Crime Data Visualizer")

    # Sidebar to select the crime data year
    option = st.sidebar.selectbox("Select a year", ('2024', '2023', '2022', '2021', '2020'))
    graph_type = st.sidebar.selectbox('Select a Chart to View', ('Top Ten Occurrences', 'Crimes by Days of the Week'))

    # chart = st.sidebar.selectbox("Select Chart to View Data", ('Top Ten Crime Occurrences', 'Total Crime'))

    if option:
        st.spinner('loading map')
        st.subheader(f"{option} Crime Data")
        col1, col2 = st.columns(2)
        # Fetch and display crime map
        with col1:
            st.pydeck_chart(pdk.Deck(
                map_style=None,
                initial_view_state=pdk.ViewState(
                    latitude=29.7604,
                    longitude=-95.3698,
                    zoom=11,
                    pitch=50,
                ),
                layers=[
                    pdk.Layer(
                        'HexagonLayer',
                        data=fetch_crime_data(option),
                        get_position='[lon, lat]',
                        radius=30,
                        auto_highlight=True,
                        elevation_scale=15,
                        elevation_range=[0, 1000],
                        pickable=False,
                        extruded=True,
                    ),
                ],
            ))
        with col2:
            if graph_type == "Top Ten Occurrences":
                plot_top_occurrences(option)
            elif graph_type == "Crimes by Days of the Week":
                crimes_by_day_of_the_week(option)
            # if chart == "Top Ten Crime Occurrences":
            #     # Fetch top ten occurrences and plot pie chart
            #     plot_top_occurrences(option)

            # elif chart == "Total Crime":
            #     crime_counts = fetch_crime_counts_by_year()
            #     plot_crime_counts(crime_counts)


if __name__ == "__main__":
    main()
