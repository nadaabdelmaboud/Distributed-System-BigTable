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


<br>[![](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5NYXN0ZXIgLS0-IFRhYmxldCBTZXJ2ZXIjMSA6IExpc3RlbnMgRm9yIEFueSBVcGRhdGVzXG5NYXN0ZXIgLS0-IFRhYmxldCBTZXJ2ZXIjMiA6IExpc3RlbnMgRm9yIEFueSBVcGRhdGVzXG5DbGllbnQjMSAtPj4gVGFibGV0IFNlcnZlciMxOiBSZWFkIFJvd3MgRnJvbSAxIFRvIDIwXG5DbGllbnQjMSAtPj4gVGFibGV0IFNlcnZlciMyOiBVcGRhdGUgUm93IDYwMFxuQ2xpZW50IzIgLT4-IFRhYmxldCBTZXJ2ZXIjMjogUmVhZCBSb3dzIEZyb20gNzAwIFRvIDgwMFxuVGFibGV0IFNlcnZlciMxLS0-PiBDbGllbnQjMSA6IFJlYWQgU3VjY2lzc2Z1bGx5XG5UYWJsZXQgU2VydmVyIzItLT4-IENsaWVudCMyIDogUmVhZCBTdWNjaXNzZnVsbHkiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlLCJhdXRvU3luYyI6dHJ1ZSwidXBkYXRlRGlhZ3JhbSI6ZmFsc2V9)](https://mermaid-js.github.io/mermaid-live-editor/edit##eyJjb2RlIjoiXG5zZXF1ZW5jZURpYWdyYW1cbk1hc3RlciAtLT4gVGFibGV0IFNlcnZlciMxIDogTGlzdGVucyBGb3IgQW55IFVwZGF0ZXNcbk1hc3RlciAtLT4gVGFibGV0IFNlcnZlciMyIDogTGlzdGVucyBGb3IgQW55IFVwZGF0ZXNcbkNsaWVudCMxIC0-PiBUYWJsZXQgU2VydmVyIzE6IFJlYWQgUm93cyBGcm9tIDEgVG8gMjBcbkNsaWVudCMxIC0-PiBUYWJsZXQgU2VydmVyIzI6IFVwZGF0ZSBSb3cgNjAwXG5DbGllbnQjMiAtPj4gVGFibGV0IFNlcnZlciMyOiBSZWFkIFJvd3MgRnJvbSA3MDAgVG8gODAwXG5UYWJsZXQgU2VydmVyIzEtLT4-IENsaWVudCMxIDogUmVhZCBTdWNjaXNzZnVsbHlcblRhYmxldCBTZXJ2ZXIjMi0tPj4gQ2xpZW50IzIgOiBSZWFkIFN1Y2Npc3NmdWxseSIsIm1lcm1haWQiOiJ7XG4gIFwidGhlbWVcIjogXCJkZWZhdWx0XCJcbn0iLCJ1cGRhdGVFZGl0b3IiOmZhbHNlLCJhdXRvU3luYyI6dHJ1ZSwidXBkYXRlRGlhZ3JhbSI6ZmFsc2V9)





<br><br><br>[![](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5DbGllbnQgLT4-IFRhYmxldCBTZXJ2ZXI6IERlbGV0ZSBSb3dzIEZyb20gNTAgVG8gNDAwXG5UYWJsZXQgU2VydmVyLS0-Pk1hc3RlcjogRGVsZXRlIEFsZXJ0IC0gQ2hlY2sgQmFsYW5jZVxuVGFibGV0IFNlcnZlci0tPj4gQ2xpZW50IDogRGVsZXRlZCBTdWNjaXNzZnVsbHlcbk1hc3RlciAtPj4gVGFibGV0IFNlcnZlcjogQWNxdWlyZSBMb2NrXG5NYXN0ZXIgLS0-PiBUYWJsZXQgU2VydmVyOiBSZWxlYXNlIExvY2sgQWZ0ZXIgQmFsYW5jaW5nXG5cbk5vdGUgcmlnaHQgb2YgTWFzdGVyOiBEZWxldGluZyAzNTAgUm93cyBDYXVzZXMgRGF0YSBVbmJhbGFuY2luZzxici8-IFNvIE1hc3RlciBUYWtlcyBDb250cm9sIChHZXRzIFRoZSBMb2NrKTxici8-IE9mIFRoZSBUYWJsZXRzIFRvIFJlYmFsYW5jZTxici8-IC5cblxuTWFzdGVyIC0-PiBDbGllbnQgOiBVcGRhdGVkIE1ldGFEYXRhIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit##eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5NYXN0ZXIgLS0-IFRhYmxldCBTZXJ2ZXIjMSA6IExpc3RlbnMgRm9yIEFueSBVcGRhdGVzXG5NYXN0ZXIgLS0-IFRhYmxldCBTZXJ2ZXIjMiA6IExpc3RlbnMgRm9yIEFueSBVcGRhdGVzXG5DbGllbnQjMSAtPj4gVGFibGV0IFNlcnZlciMxOiBSZWFkIFJvd3MgRnJvbSAxIFRvIDIwXG5DbGllbnQjMSAtPj4gVGFibGV0IFNlcnZlciMyOiBVcGRhdGUgUm93IDYwMFxuQ2xpZW50IzIgLT4-IFRhYmxldCBTZXJ2ZXIjMjogUmVhZCBSb3dzIEZyb20gNzAwIFRvIDgwMFxuVGFibGV0IFNlcnZlciMxLS0-PiBDbGllbnQjMSA6IFJlYWQgU3VjY2lzc2Z1bGx5XG5UYWJsZXQgU2VydmVyIzItLT4-IENsaWVudCMyIDogUmVhZCBTdWNjaXNzZnVsbHkiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

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
