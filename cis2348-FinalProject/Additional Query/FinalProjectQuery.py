# Raul Morfin
# PSID:1892863

import csv
from datetime import datetime


def check_if_date_is_overdue(date):
    # Takes in a list with a dat
    a_date = date[4]
    # Extracts the actual date from the list
    a_date = datetime.strptime(a_date, '%m/%d/%Y')
    # Formats the date to be able to compare with the present date
    present = datetime.today()
    # The present date is assigned to a variable
    if a_date < present:
        return False
    else:
        return True
    # This if statement checks to see if a service date is past the present date


with open('ManufacturerList.csv', 'r') as Inventory:
    csv_reader = list(csv.reader(Inventory))
    item_id = []
    for a_list in csv_reader:
        item_id.append(a_list[0])
        # Adds items ID to a list
    item_id.sort()
    # This sorts the item IDs in ascending order in a list
    new_sorted_csv2 = []
    for id_of_item in item_id:
        for a_list in csv_reader:
            if id_of_item in a_list:
                new_sorted_csv2.append(a_list)
                csv_reader.remove(a_list)
    # This nested for loop appends the manufacturer list to a new empty list with the item IDs sorted
    manufacturer_list = []
    for i in new_sorted_csv2:
        manufacturer_list.append(i[1])
    # This loop iterates through the item ID sorted list and appends the manufacturer name to the
    # empty list "manufacturer_list".
    manufacturer_list.sort()
    new_sorted_csv = []
    for company in manufacturer_list:
        for items in new_sorted_csv2:
            if company in items:
                new_sorted_csv.append(items)
                new_sorted_csv2.remove(items)
    # This nested for loop sorts the list by company name then sorts it by the item id
    with open('Pricelist.csv', 'r') as PriceList:
        csv_reader_3 = csv.reader(PriceList)
        for price_id in csv_reader_3:
            index = 0
            for the_list in new_sorted_csv:
                if price_id[0] in the_list:
                    new_sorted_csv[index].insert(3, price_id[1])
                    index += 1
                else:
                    index += 1
        # This nested for loop adds appends the price to each item based on their item and if it matchs
        with open('ServiceDatesList.csv', 'r') as ServiceDates:
            csv_reader2 = csv.reader(ServiceDates)
            for date_id in csv_reader2:
                index = 0
                for a_list in new_sorted_csv:
                    if date_id[0] in a_list:
                        new_sorted_csv[index].insert(4, date_id[1])
                        index += 1
                    else:
                        index += 1
            # This nested for loop appends each servicedate to the coresponding item ID
            for item in new_sorted_csv:
                all_items = ','.join(item)
            # This for loop joins the list with a comma after each entry
            for a_list_in_csv in new_sorted_csv:
                check_if_date_is_overdue(a_list_in_csv)
            # This loop checks to make sure dates are not overdue
            for damaged_item in new_sorted_csv:
                if damaged_item[5] == 'damaged':
                    all_damaged = ','.join(damaged_item[0:5])
            # This loop checks to see if an item is damaged
            item_type_list = []
            for item_type in new_sorted_csv:
                if item_type[2] in item_type_list:
                    continue
                else:
                    item_type_list.append(item_type[2])
            # This for checks what kind of devices are in all the list from the manufacturer.csv file
            for item_type in item_type_list:
                new_list = []
                new_sorted_csv_copy = new_sorted_csv.copy()
                for a_list in new_sorted_csv_copy:
                    if item_type in a_list:
                        new_list.append(a_list)
            # This nested for loop outputs all the list sorted by the company name then item ID. Then appends the
            # corresponding dates to each list. Then adds the word "damaged" if an item is damaged
            manufacturer_device = ''
            while manufacturer_device != 'q':
                manufacturer_device = str(input('Please enter the Manufacturer and Device name (type \'q\' to quit):'))
                manufacturer_device_input_list = manufacturer_device.split()
                # splits the input into a list
                new_device = []
                new_company = []
                maximum = 0
                second_max = 0
                for item in manufacturer_device_input_list:
                    for comapany in new_sorted_csv:
                        if item.strip().lower() == comapany[1].strip().lower():
                            new_company.append(item)
                            break
                # This nested for loop looks for the name of a company within the input
                for item in manufacturer_device_input_list:
                    for device in new_sorted_csv:
                        if item.strip().lower() == device[2].strip().lower():
                            new_device.append(item)
                            break
                # This nested for loop looks for the name of a device within the input
                new_company = ''.join(new_company)
                new_device = ''.join(new_device)
                count = 0
                i = 0
                new_list_to_print = []
                for line in new_sorted_csv:
                    if new_company.strip().lower() == line[1].strip().lower() and new_device.strip().lower() \
                            == line[2].strip().lower():
                        if check_if_date_is_overdue(line) is False:
                            continue
                        else:
                            if line[5] == 'damaged':
                                continue
                            else:
                                if int(line[3]) > maximum:
                                    maximum = int(line[3])
                                    maximum_line = line
                                    count += 1
                # This For loop with if statments checks if the user input is valid and will output
                # a device that was specified with all of its details
                if maximum > 0:
                    new_line_print = ' '.join(maximum_line)
                    print(f'Your item is: {new_line_print}')
                elif manufacturer_device == 'q':
                    quit()
                else:
                    print('No such item in inventory')
                # This nested if else statement outputs a device and its details, quits out the program or outputs "No
                # such item in inventory' if there was no valid input
                for line in new_sorted_csv:
                    if not (new_company.strip().lower() == line[1].strip().lower()) is True and \
                            new_device.strip().lower() == line[2].strip().lower():
                        if check_if_date_is_overdue(line) is True:
                            if not (line[5] == 'damaged'):
                                if maximum - int(line[3]) > second_max:
                                    if second_max < maximum:
                                        count += 1
                                        second_max = int(line[3])
                                        second_max_line = line
                                        new_line_print = ' '.join(line)
                                        print(f'You may, also, consider: {new_line_print}')
