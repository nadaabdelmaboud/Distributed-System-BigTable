# Distributed System - BigTable

Distributed system for managing structured data that is designed to scale to a very large size.

## Data Model

The data this system manages consists of One BigTable that is sharded into        
3 tablets divided by Row Key , Each tablet is assigned a key range of data .


## System Components

The system consists of 3 major components : 
 1. One Master Server
 2. Two Tablet Servers
 3. Many Clients



## Master Server	

  - Tablets Assignment
  - Listens For Any Updates Requests And Checks For Balancing
  - Blances Data between the 3 Tablets Whenever Necessary
  - Updates Metadata And Resends It To The Clients
  - Manages Logs For The Whole System In A local File System

## Tablet Servers	

  - Each Tablet Server Manages One Or Two Tablets
  - Provides API For Clients
  - Handles Multiple Requests At A Time (Locking)
  - Sends Updates Periodically To Master
  - Sends Its Logs To Master Periodically
  
## Client	

  - Sends Requests To Tablet Servers Based On The Provided API
  - Manages Sending Requests To The Right Tabler Server Based On The Provided MetaData
<div text-align="center" >  

|API Functions|
|--|
| Read Row/s |
| Delete Row/s |
| Update Row/s |
| Delete Row/s Field/s |
| Insert Row/s |

</div>

## Sample Examples

```mermaid
sequenceDiagram
Master --> Tablet Server#1 : Listens For Any Updates
Master --> Tablet Server#2 : Listens For Any Updates
Client#1 ->> Tablet Server#1: Read Rows From 1 To 20
Client#1 ->> Tablet Server#2: Update Row 600
Client#2 ->> Tablet Server#2: Read Rows From 700 To 800
Tablet Server#1-->> Client#1 : Read Succissfully
Tablet Server#2-->> Client#2 : Read Succissfully

```


```mermaid
sequenceDiagram
Client ->> Tablet Server: Delete Rows From 50 To 400
Tablet Server-->>Master: Delete Alert - Check Balance
Tablet Server-->> Client : Deleted Succissfully
Master ->> Tablet Server: Acquire Lock
Master -->> Tablet Server: Release Lock After Balancing

Note right of Master: Deleting 350 Rows Causes Data Unbalancing<br/> So Master Takes Control (Gets The Lock)<br/> Of The Tablets To Rebalance<br/> .

Master ->> Client : Updated MetaData
```

## Tools

- Nodejs
- Mongodb
- Socket.io
- Async-Mutux


## Contributors
<table>
  <tr>
    <td align="center">
    <a href="https://github.com/nadaabdelmaboud" target="_black">
    <b>Nada Abdelmaboud</b></a>
    </td>    
    <td align="center">
    <a href="https://github.com/MENNA123MAHMOUD" target="_black">
    <b>Menna Mahmoud</b></a>
    </td>   
        <td align="center">
    <a href="https://github.com/hagerali99" target="_black">
    <b>Hager Ismael</b></a>
    </td>   
        <td align="center">
    <a href="https://github.com/Nihal-Mansour" target="_black">
    <b>Nihal Mansour</b></a>
    </td>   
        <td align="center">
    <a href="https://github.com/ayaadelhassan" target="_black">
    <b>Aya Adel</b></a>
    </td>   
  </tr>
 </table>

## License

> This software is licensed under MIT License, See [License](https://github.com/nadaabdelmaboud/BigTable/blob/main/LICENSE)
