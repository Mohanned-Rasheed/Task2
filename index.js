import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import csvjson from "csvjson";
// website we will scrapping it
const url =
  "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population";
//array of objects to store every contry in object
var countriesData = [];
//to get the html content from the website using axios its like fetch but better
async function getHTML() {
  try {
    //deconstruct Object only html content from the website
    const { data: html } = await axios.get(url);
    return html;
  } catch (error) {
    console.log("Url is Wrong or url page deleted \n" + error);
  }
}

//call the method to start the proccess
getHTML().then((res) => {
  // using the html content with cheerio pcakge, and its take $ as in the document
  const $ = cheerio.load(res);
  //here i slecete the css or class that nedded to reach to the table on content in the website
  $(".wikitable>tbody").each((i, country) => {
    //get all table rows to exctract the lenght from it to use it in the loop
    const tableLength = $(country).find("tr").length;
    //loop throw every row to extract the data
    for (let i = 1; i < tableLength; i++) {
      // here something weierd happend i needed to target this row because its table data diffrent from the others. here the table of data start from 0(Location)
      if (i == 3) {
        countriesData.push({
          Location: $(country).find(`tr:eq(${i})>td:eq(0)`).text(),
          Population: $(country).find(`tr:eq(${i})>td:eq(1)`).text(),
          ofWorld: $(country).find(`tr:eq(${i})>td:eq(2)`).text(),
          Date: $(country).find(`tr:eq(${i})>td:eq(3)`).text(),
          Source: $(country).find(`tr:eq(${i})>td:eq(4)`).text(),
        });
        //pass its itreation
        continue;
      }
      //get the data from the table row to go throw every row and get from it the td(table data)
      countriesData.push({
        //1 for Location, 2 for Population, 3 for %_of_World, 4 for Date, 5 for Source
        Location: $(country).find(`tr:eq(${i})>td:eq(1)`).text(),
        Population: $(country).find(`tr:eq(${i})>td:eq(2)`).text(),
        ofWorld: $(country).find(`tr:eq(${i})>td:eq(3)`).text(),
        Date: $(country).find(`tr:eq(${i})>td:eq(4)`).text(),
        Source: $(country).find(`tr:eq(${i})>td:eq(5)`).text(),
      });
    }
  });
  //i used packge name csvjson to convert JSON to .csv
  try {
    const csvData = csvjson.toCSV(countriesData, { headers: "key" });
    //write the csv and name it Result.csv
    fs.writeFile("Result.csv", csvData, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
  }
});
