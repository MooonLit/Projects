# Importing the Flask framework and necessary modules
import hashlib
import datetime
import time
import flask
from flask import jsonify
from flask import request, make_response
import creds as creds
from sql import create_connection
from sql import execute_read_query
from sql import execute_query

app = flask.Flask(__name__)
app.config["Debug"] = True



authorizedusers = [
  {
    #default use
    'username': 'username',
    'password': 'password',
    'role': 'Admin',
    'token': '0',
    'admininfo': None
  },
]

@app.route('/login', methods = ['GET'])
def app_login():
    username = request.headers['username'] #get header parameter
    pw = request.headers['password']
    for au in authorizedusers: 
        if au['username'] == username and au['password'] == pw: #found an auth user
          sessiontoken = au['token']
          admininfo = au['admininfo']
          app = []
          app.append(au['role'])
          return jsonify(app)
    return 'DOES NOT WORK'


# GET methods are below


@app.route('/api/floor', methods=['GET'])
def see_all_floors():
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM floor"
    cursor.execute(sql)
    floor = cursor.fetchall()
    return jsonify(floor)
@app.route('/api/room', methods=['GET'])
def see_all_rooms():
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM room"
    cursor.execute(sql)
    room = cursor.fetchall()
    return jsonify(room)
@app.route('/api/resident', methods=['GET'])
def see_all_residents():
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT * FROM resident"
    cursor.execute(sql)
    resident = cursor.fetchall()
    return jsonify(resident)


# POST methods are below

# floor POST method

@app.route('/api/floor', methods=['POST'])
def add_floor():
    request_data = request.get_json()
    newFloorLevel = request_data['level']
    NewFloorName = request_data['name']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("INSERT INTO floor(level, name) VALUES " "('%s', '%s')") % (newFloorLevel, NewFloorName)
    execute_query(conn, sql)
    return 'Add request successful!'

# room POST method

@app.route('/api/room', methods=['POST'])
def add_room():
    request_data = request.get_json()
    RoomCapacity = request_data['capacity']
    RoomNumber = request_data['number']
    Floor = request_data['floor']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("INSERT INTO room(capacity, number, floor) VALUES " "('%s', '%s', '%s')") % (RoomCapacity, RoomNumber, Floor)
    execute_query(conn, sql)
    return 'Add request successful!'

# resident POST method

@app.route('/api/resident', methods=['POST'])
def add_resident():
    request_data = request.get_json()
    FirstName = request_data['firstname']
    LastName = request_data['lastname']
    Age = request_data['age']
    Room = request_data['room']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("INSERT INTO resident(firstname, lastname, age, room) VALUES " "('%s', '%s', '%s', '%s')") % (FirstName, LastName, Age, Room)
    execute_query(conn, sql)
    return 'Add request successful!'


# DELETE methods are below


#floor DELETE method is below

@app.route('/api/floor', methods=['DELETE'])
def delete_floor():
    request_data = request.get_json()
    id_to_delete = request_data['id']
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("DELETE FROM floor WHERE id = %s" % id_to_delete)
    execute_query(conn, sql)
    
    return f'Floor id: \'{id_to_delete}\' successfuly deleted!'

#room DELETE method is below

@app.route('/api/room', methods=['DELETE'])
def delete_room():
    request_data = request.get_json()
    id_to_delete = request_data['id']
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("DELETE FROM room WHERE id = %s" % id_to_delete)
    execute_query(conn, sql)
    
    return f'Room id: \'{id_to_delete}\' successfuly deleted!'

#resident DELETE method is below

@app.route('/api/resident', methods=['DELETE'])
def delete_resident():
    request_data = request.get_json()
    id_to_delete = request_data['id']
    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = ("DELETE FROM resident WHERE id = %s" % id_to_delete)
    execute_query(conn, sql)
    
    return f'Resident id: \'{id_to_delete}\' successfuly deleted!'


#PUT methods below



#floor PUT method

@app.route('/api/floor/<int:id_to_update>', methods=['PUT'])
def update_floor(id_to_update):
    request_data = request.get_json()
    newFloorLevel = request_data['level']
    NewFloorName = request_data['name']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = "UPDATE floor SET level = %s, name = %s WHERE id = %s;"
    values = (newFloorLevel, NewFloorName, id_to_update)
    cursor = conn.cursor()
    cursor.execute(sql, values)
    conn.commit()

    return f'Successfully updated Floor id: \'{id}\'!'


@app.route('/api/room/<int:id_to_update>', methods=['PUT'])
def update_room(id_to_update):
    request_data = request.get_json()
    RoomCapacity = request_data['capacity']
    RoomNumber = request_data['number']
    Floor = request_data['floor']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = "UPDATE room SET capacity = %s, number = %s, floor = %s WHERE id = %s;"
    values = (RoomCapacity, RoomNumber, Floor, id_to_update)
    cursor = conn.cursor()
    cursor.execute(sql, values)
    conn.commit()

    return f'Successfully updated Room id: \'{id_to_update}\'!'



@app.route('/api/resident/<int:id_to_update>', methods=['PUT'])
def update_resident(id_to_update):
    request_data = request.get_json()
    FirstName = request_data['firstname']
    LastName = request_data['lastname']
    Age = request_data['age']
    Room = request_data['room']

    myCreds = creds.Creds()
    conn = create_connection(myCreds.conString, myCreds.userName, myCreds.password, myCreds.database)
    sql = "UPDATE resident SET firstname = %s, lastname = %s, age = %s, room = %s WHERE id = %s;"
    values = (FirstName, LastName, Age, Room, id_to_update)
    cursor = conn.cursor()
    cursor.execute(sql, values)
    conn.commit()

    return f'Successfully updated Resident id: \'{id}\'!'
# Update an animal's information using PUT method
    
# Running the Flask application
app.run()
