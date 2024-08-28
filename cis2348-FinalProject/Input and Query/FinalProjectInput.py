# Raul Morfin
# PSID:1892863

import csv
from datetime import datetime


def check_if_date_is_overdue(date):
    a_date = date[4]
    a_date = datetime.strptime(a_date, '%m/%d/%Y')
    present = datetime.today()
    if a_date < present:
        all_dates = ','.join(date)
        PastDates.write(f'{all_dates}\n')


ManufacturerList = input()
Pricelist = input()
Servicedates = input()
with open(ManufacturerList, 'r') as Inventory:
    with open('FullInventory.csv', 'w') as FullInventory:
        with open('PastServiceDateInventory.csv', 'w') as PastDates:
            with open('DamagedInventory.csv', 'w') as Damagedinventory:
                csv_reader = list(csv.reader(Inventory))
                item_id = []
                for a_list in csv_reader:
                    item_id.append(a_list[0])
                item_id.sort()
                new_sorted_csv2 = []
                for id_of_item in item_id:
                    for a_list in csv_reader:
                        if id_of_item in a_list:
                            new_sorted_csv2.append(a_list)
                            csv_reader.remove(a_list)
                manufacturer_list = []
                for i in new_sorted_csv2:
                    manufacturer_list.append(i[1])
                manufacturer_list.sort()
                new_sorted_csv = []
                for company in manufacturer_list:
                    for items in new_sorted_csv2:
                        if company in items:
                            new_sorted_csv.append(items)
                            new_sorted_csv2.remove(items)
                with open(Pricelist, 'r') as PriceList:
                    csv_reader_3 = csv.reader(PriceList)
                    for price_id in csv_reader_3:
                        index = 0
                        for the_list in new_sorted_csv:
                            if price_id[0] in the_list:
                                new_sorted_csv[index].insert(3, price_id[1])
                                index += 1
                            else:
                                index += 1
                    with open(Servicedates, 'r') as ServiceDates:
                        csv_reader2 = csv.reader(ServiceDates)
                        for date_id in csv_reader2:
                            index = 0
                            for a_list in new_sorted_csv:
                                if date_id[0] in a_list:
                                    new_sorted_csv[index].insert(4, date_id[1])
                                    index += 1
                                else:
                                    index += 1
                        for item in new_sorted_csv:
                            all_items = ','.join(item)
                            FullInventory.write(f'{all_items}\n')
                        for a_list_in_csv in new_sorted_csv:
                            check_if_date_is_overdue(a_list_in_csv)
                        for damaged_item in new_sorted_csv:
                            if damaged_item[5] == 'damaged':
                                all_damaged = ','.join(damaged_item[0:5])
                                Damagedinventory.write(f'{all_damaged}\n')
                        item_type_list = []
                        for item_type in new_sorted_csv:
                            if item_type[2] in item_type_list:
                                continue
                            else:
                                item_type_list.append(item_type[2])
                        for item_type in item_type_list:
                            new_list = []
                            new_sorted_csv_copy = new_sorted_csv.copy()
                            for a_list in new_sorted_csv_copy:
                                if item_type in a_list:
                                    new_list.append(a_list)
                            with open(f'{item_type.capitalize()}Inventory.csv', 'w') as item:
                                # print(new_list)
                                for items in new_list:
                                    del items[2]
                                    all_items = ','.join(items)
                                    item.write(f'{all_items}\n')
