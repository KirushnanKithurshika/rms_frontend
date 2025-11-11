import React from "react";

import SignatureBoard from "../../../SignatureCanvas/SignatureCanvas";

const ResultsSheetMain = ({ }) => {
  return (
    <section className="sheet a4">
      {/* ===== Footer Section ===== */}
      <section className="footer-block">
        <div className="canvas">
          <SignatureBoard />
        </div>

        <div className="cols">
          {/* Left side - signature */}
          <div className="left">
            <div className="sig-line" />
            <div className="sig-text">
              <div className="sig-name"></div>
              <div className="sig-role">
                
              </div>
              <div className="mutedT">(Not valid without the embossed seal)</div>
            </div>
          </div>

          {/* Right side - issue date */}
          <div className="right">
            <div className="date">
                    </div>
            <div className="date-line"></div>
            <div className="mutedTD">Date of Issue</div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ResultsSheetMain;
