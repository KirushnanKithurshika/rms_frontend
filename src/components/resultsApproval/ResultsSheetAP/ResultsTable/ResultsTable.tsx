import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import './ResultsTable.css';

const ResultsTable = () => {



  return (
    <div className="RT">

      <div >
       <table id="results-table" className="results-table rs-table">
  <thead>
    <tr>
      <th>Reg. No.</th>
      <th>Name</th>
      <th>CE1101</th>
      <th>CE1202</th>
      <th>EE1101</th>
      <th>EE1302</th>
      <th>ME1201</th>
      <th>ME1202</th>
      <th>IS1301</th>
      <th>IS1402</th>
      <th>SGPA</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>EG/2020/3801</td><td>Student A A</td><td>A</td><td>B+</td><td>A-</td><td>A</td><td>B</td><td>A</td><td>B+</td><td>A-</td><td>3.67</td></tr>
    <tr><td>EG/2020/3802</td><td>Student B B</td><td>B+</td><td>B</td><td>A</td><td>A-</td><td>A</td><td>B+</td><td>C+</td><td>B+</td><td>3.20</td></tr>
    <tr><td>EG/2020/3803</td><td>Student C C</td><td>A-</td><td>A</td><td>B+</td><td>B</td><td>A</td><td>A-</td><td>A</td><td>B+</td><td>3.52</td></tr>
    <tr><td>EG/2020/3804</td><td>Student D D</td><td>B</td><td>B+</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>B</td><td>A</td><td>3.25</td></tr>
    <tr><td>EG/2020/3805</td><td>Student E E</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>3.85</td></tr>
    <tr><td>EG/2020/3806</td><td>Student F F</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>B+</td><td>A</td><td>B</td><td>B+</td><td>3.35</td></tr>
    <tr><td>EG/2020/3807</td><td>Student G G</td><td>A-</td><td>B</td><td>B</td><td>A</td><td>A</td><td>B+</td><td>A-</td><td>A</td><td>3.48</td></tr>
    <tr><td>EG/2020/3808</td><td>Student H H</td><td>B</td><td>C+</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>B+</td><td>A-</td><td>3.18</td></tr>
    <tr><td>EG/2020/3809</td><td>Student I I</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>3.92</td></tr>
    <tr><td>EG/2020/3810</td><td>Student J J</td><td>B+</td><td>B+</td><td>B</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>3.10</td></tr>

    <tr><td>EG/2020/3811</td><td>Student K K</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>B+</td><td>3.78</td></tr>
    <tr><td>EG/2020/3812</td><td>Student L L</td><td>B+</td><td>B</td><td>A-</td><td>B+</td><td>A</td><td>A-</td><td>B</td><td>B+</td><td>3.28</td></tr>
    <tr><td>EG/2020/3813</td><td>Student M M</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>3.90</td></tr>
    <tr><td>EG/2020/3814</td><td>Student N N</td><td>B</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.12</td></tr>
    <tr><td>EG/2020/3815</td><td>Student O O</td><td>A-</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>3.84</td></tr>
    <tr><td>EG/2020/3816</td><td>Student P P</td><td>B+</td><td>A-</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>B+</td><td>A</td><td>3.40</td></tr>
    <tr><td>EG/2020/3817</td><td>Student Q Q</td><td>A</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>3.95</td></tr>
    <tr><td>EG/2020/3818</td><td>Student R R</td><td>B</td><td>B</td><td>A-</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>3.05</td></tr>
    <tr><td>EG/2020/3819</td><td>Student S S</td><td>A-</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>3.82</td></tr>
    <tr><td>EG/2020/3820</td><td>Student T T</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>A</td><td>B+</td><td>B</td><td>B+</td><td>3.22</td></tr>

    <tr><td>EG/2020/3821</td><td>Student U U</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>3.88</td></tr>
    <tr><td>EG/2020/3822</td><td>Student V V</td><td>B+</td><td>B</td><td>A</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>3.26</td></tr>
    <tr><td>EG/2020/3823</td><td>Student W W</td><td>A-</td><td>A</td><td>B+</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>3.74</td></tr>
    <tr><td>EG/2020/3824</td><td>Student X X</td><td>B</td><td>B+</td><td>B</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.00</td></tr>
    <tr><td>EG/2020/3825</td><td>Student Y Y</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>3.86</td></tr>
    <tr><td>EG/2020/3826</td><td>Student Z Z</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>A</td><td>B+</td><td>A-</td><td>3.45</td></tr>
    <tr><td>EG/2020/3827</td><td>Student AA</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>A-</td><td>A</td><td>3.80</td></tr>
    <tr><td>EG/2020/3828</td><td>Student AB</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>3.21</td></tr>
    <tr><td>EG/2020/3829</td><td>Student AC</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>4.00</td></tr>
    <tr><td>EG/2020/3830</td><td>Student AD</td><td>B</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.08</td></tr>

    <tr><td>EG/2020/3831</td><td>Student AE</td><td>A-</td><td>A-</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A-</td><td>A</td><td>3.76</td></tr>
    <tr><td>EG/2020/3832</td><td>Student AF</td><td>B+</td><td>B</td><td>A</td><td>A-</td><td>A</td><td>B+</td><td>B+</td><td>B+</td><td>3.30</td></tr>
    <tr><td>EG/2020/3833</td><td>Student AG</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>3.89</td></tr>
    <tr><td>EG/2020/3834</td><td>Student AH</td><td>B</td><td>B+</td><td>B</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.01</td></tr>
    <tr><td>EG/2020/3835</td><td>Student AI</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>3.83</td></tr>
    <tr><td>EG/2020/3836</td><td>Student AJ</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>A-</td><td>3.36</td></tr>
    <tr><td>EG/2020/3837</td><td>Student AK</td><td>A</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>3.94</td></tr>
    <tr><td>EG/2020/3838</td><td>Student AL</td><td>B</td><td>B</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>B+</td><td>B+</td><td>3.06</td></tr>
    <tr><td>EG/2020/3839</td><td>Student AM</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A-</td><td>B+</td><td>A</td><td>3.79</td></tr>
    <tr><td>EG/2020/3840</td><td>Student AN</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>A</td><td>B+</td><td>B</td><td>B+</td><td>3.23</td></tr>
  <tr><td>EG/2020/3821</td><td>Student U U</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>3.88</td></tr>
    <tr><td>EG/2020/3822</td><td>Student V V</td><td>B+</td><td>B</td><td>A</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>3.26</td></tr>
    <tr><td>EG/2020/3823</td><td>Student W W</td><td>A-</td><td>A</td><td>B+</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>3.74</td></tr>
    <tr><td>EG/2020/3824</td><td>Student X X</td><td>B</td><td>B+</td><td>B</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.00</td></tr>
    <tr><td>EG/2020/3825</td><td>Student Y Y</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>3.86</td></tr>
    <tr><td>EG/2020/3826</td><td>Student Z Z</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>A</td><td>A</td><td>B+</td><td>A-</td><td>3.45</td></tr>
    <tr><td>EG/2020/3827</td><td>Student AA</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>A-</td><td>A</td><td>3.80</td></tr>
    <tr><td>EG/2020/3828</td><td>Student AB</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>3.21</td></tr>
    <tr><td>EG/2020/3829</td><td>Student AC</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>4.00</td></tr>
    <tr><td>EG/2020/3830</td><td>Student AD</td><td>B</td><td>B+</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.08</td></tr>

    <tr><td>EG/2020/3831</td><td>Student AE</td><td>A-</td><td>A-</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A-</td><td>A</td><td>3.76</td></tr>
    <tr><td>EG/2020/3832</td><td>Student AF</td><td>B+</td><td>B</td><td>A</td><td>A-</td><td>A</td><td>B+</td><td>B+</td><td>B+</td><td>3.30</td></tr>
    <tr><td>EG/2020/3833</td><td>Student AG</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>A</td><td>3.89</td></tr>
    <tr><td>EG/2020/3834</td><td>Student AH</td><td>B</td><td>B+</td><td>B</td><td>B+</td><td>B+</td><td>B+</td><td>B</td><td>B+</td><td>3.01</td></tr>
    <tr><td>EG/2020/3835</td><td>Student AI</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A</td><td>3.83</td></tr>
    <tr><td>EG/2020/3836</td><td>Student AJ</td><td>B+</td><td>A</td><td>A-</td><td>B+</td><td>B+</td><td>A-</td><td>B+</td><td>A-</td><td>3.36</td></tr>
    <tr><td>EG/2020/3837</td><td>Student AK</td><td>A</td><td>A</td><td>A</td><td>A</td><td>B+</td><td>A</td><td>A</td><td>A</td><td>3.94</td></tr>
    <tr><td>EG/2020/3838</td><td>Student AL</td><td>B</td><td>B</td><td>A-</td><td>B+</td><td>B+</td><td>B+</td><td>B+</td><td>B+</td><td>3.06</td></tr>
    <tr><td>EG/2020/3839</td><td>Student AM</td><td>A-</td><td>A</td><td>A</td><td>A</td><td>A-</td><td>A-</td><td>B+</td><td>A</td><td>3.79</td></tr>
    <tr><td>EG/2020/3840</td><td>Student AN</td><td>B+</td><td>B+</td><td>B+</td><td>A-</td><td>A</td><td>B+</td><td>B</td><td>B+</td><td>3.23</td></tr>

  </tbody>
</table>
      </div>
    </div>
  );
};

export default ResultsTable;
