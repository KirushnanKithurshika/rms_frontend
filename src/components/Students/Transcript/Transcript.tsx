import React, { useMemo } from "react";
import "./Transcript.css";
import unilogo from "../../../assets/logoT.png";
import SemesterTables from "./SemResTable/SemResTable";
import TranscriptExplanation from "./TranscriptExplaination/TranscriptExplanation";

export type ContactInfo = {
  telephone?: string;
  fax?: string;
  web?: string;
  email?: string;
  addressLines?: string[];
};

export type UniversityInfo = {
  nameLine1: string;
  nameLine2?: string;
  addressHeadline?: string;
  logoUrl?: string;
  contact?: ContactInfo;
};

export type StudentInfo = {
  fullName: string;
  registrationNo: string;
  gender?: string;
  dateOfBirth?: string;
  serialNo?: string;
};

export type ProgrammeInfo = {
  degreeAwarded: string;
  fieldOfSpecialization: string;
  effectiveDate?: string;
  overallGPA?: string;
  overallGradePointAverage?: string;
  academicStanding?: string;
  medium?: string;
};

export type TranscriptData = {
  serialNo?: string;
  university: UniversityInfo;
  student: StudentInfo;
  programme: ProgrammeInfo;
  issueDate?: string;
  registrarTitle?: string;
  footerNotes?: string[];

};

const DEFAULT_UNI: UniversityInfo = {
  nameLine1: "UNIVERSITY OF RUHUNA,  SRI LANKA",
  nameLine2: "FACULTY OF ENGINEERING",
  addressHeadline: "HAPUGALA,  GALLE   80000,  SRI LANKA.",
  logoUrl: unilogo,
  contact: {
    telephone: "+94 91 2245764",
    fax: "+94 91 2245762",
    web: "http://www.eng.ruh.ac.lk",
    email: "reg@eng.ruh.ac.lk",
  },
};

const SAMPLE_DATA: TranscriptData = {
  serialNo: "EG-TR-002181",
  university: {} as UniversityInfo,
  student: {
    fullName: "Pamith Perera",
    registrationNo: "EG/2020/1234",
    gender: "Male",
    dateOfBirth: "1999-08-05",
  },
  programme: {
    degreeAwarded: "Bachelor of the Science of Engineering Honours",
    fieldOfSpecialization: "Computer Engineering",
    effectiveDate: "2025-09-25",
    overallGradePointAverage: "3.72",
    academicStanding: "BScEngHons",
    medium: "English",
  },
  issueDate: "25 SEP 2025",
  registrarTitle: "Assistant Registrar / Faculty of Engineering",
};

type Props = { data?: TranscriptData };



const Transcript: React.FC<Props> = ({ data = SAMPLE_DATA }) => {
  const u: UniversityInfo = useMemo(() => {
    const incoming = data?.university ?? ({} as UniversityInfo);
    return {
      ...DEFAULT_UNI,
      ...incoming,
      contact: { ...DEFAULT_UNI.contact, ...(incoming.contact ?? {}) },
      logoUrl: incoming.logoUrl || DEFAULT_UNI.logoUrl,
    };
  }, [data]);

  const s = data?.student ?? ({} as StudentInfo);
  const p = data?.programme ?? ({} as ProgrammeInfo);

  const serial = data?.serialNo ?? s?.serialNo;
  const ogpa = p?.overallGPA ?? p?.overallGradePointAverage;

  // captions for the strip on page 2
  const leftCaption = "Academic Transcript";
  const rightCaption = u?.nameLine1 || "University";

  return (
    <>
      {/* ===== Page 1 ===== */}
      <section className="sheet a4">
        <header className="uni-header">
          <div className="seal">
            <img src={u.logoUrl!} alt="University Seal" className="seal-img" />
          </div>

          <div className="uni-titles">
            <div className="u-name">{u.nameLine1}</div>
            <div className="u-faculty">{u.nameLine2}</div>
            <div className="u-address-head">{u.addressHeadline}</div>

            <div className="contact-grid">
              <span className="cell"><em>Telephone :</em> {u.contact?.telephone}</span>
              <span className="cell"><em>Fax :</em> {u.contact?.fax}</span>
              <span className="cell"><em>Web:</em> {u.contact?.web}</span>
              <span className="cell"><em>E-mail:</em> {u.contact?.email}</span>
            </div>
          </div>
        </header>

        <div className="serial">
          {serial ? <>Serial No :{serial}</> : null}
        </div>

        <div className="banner">ACADEMIC TRANSCRIPT</div>

        <section className="box profile">
          <dl className="grid-2">
            <div><dt>Full Name :</dt><dd>{s.fullName || "—"}</dd></div>
            <div><dt>Registration No :</dt><dd>{s.registrationNo || "—"}</dd></div>
            <div><dt>Gender :</dt><dd>{s.gender || "—"}</dd></div>
            <div><dt>Date of Birth:</dt><dd>{s.dateOfBirth || "—"}</dd></div>
          </dl>
        </section>

        <section className="box programme">
          <dl className="grid-2">
            <div><dt>Degree Awarded:</dt><dd>{p.degreeAwarded || "—"}</dd></div>
            <div><dt>Field of Specialization:</dt><dd>{p.fieldOfSpecialization || "—"}</dd></div>
            <div><dt>Effective Date:</dt><dd>{p.effectiveDate || "—"}</dd></div>
            <div><dt>Overall Grade Point Average:</dt><dd>{ogpa || "—"}</dd></div>
            <div><dt>Academic Standing:</dt><dd>{p.academicStanding || "—"}</dd></div>
          </dl>
        </section>

        <div className="mutedT small">
          Medium of Instructions is {p.medium || "English"}
        </div>

        <section className="footer-block">
          <div className="cols">
            <div className="left">
              <div className="sig-line" />
              <div className="sig-text">
                <div className="sig-name"></div>
                <div className="sig-role">
                  {data?.registrarTitle || "Assistant Registrar / Faculty of Engineering"}
                </div>
                <div className="mutedT ">(Not valid without the embossed seal)</div>
              </div>
            </div>

            <div className="right">
              <div className="date-stamp">{data?.issueDate || ""}</div>
              <div className="date-line"></div>
              <div className="mutedTD">Date of Issue</div>
            </div>
          </div>
        </section>
      </section>

      {/* ===== Page 2 ===== */}
      <section className="sheet a4">
        <div className="strip">
          <div className="pstrip-caption">
            <span className="left">Academic Transcript</span>
            <span className="right">{u.nameLine1}</span>
          </div>

          <div className="pstrip">

            <div className="pstrip-row prow1">
              <div className="ppair">
                <span className="lab">Full Name :</span>
                <span className="val">{s.fullName}</span>
              </div>
            </div>


            <div className="pstrip-row pgridPairs3">
              <div className="ppair">
                <span className="lab">Registration No :</span>
                <span className="val">{s.registrationNo}</span>
              </div>
              <div className="ppair">
                <span className="lab">Date of Birth :</span>
                <span className="val">{s.dateOfBirth}</span>
              </div>
              <div className="ppair">
                <span className="lab">Gender :</span>
                <span className="val">{s.gender}</span>
              </div>
            </div>


            <div className="pstrip-row prow1">
              <div className="ppair">
                <span className="lab">Field of Specialization :</span>
                <span className="val">{p.fieldOfSpecialization}</span>
              </div>
            </div>
          </div>

        </div>
        <SemesterTables />

        <section className="footer-block">
          <div className="cols">
            <div className="left">
              <div className="sig-line" />
              <div className="sig-text">
                <div className="sig-name"></div>
                <div className="sig-role">
                  {data?.registrarTitle || "Assistant Registrar / Faculty of Engineering"}
                </div>
                <div className="mutedT ">(Not valid without the embossed seal)</div>
              </div>
            </div>

            <div className="right">
              <div className="date-stamp">{data?.issueDate || ""}</div>
              <div className="date-line"></div>
              <div className="mutedTD">Date of Issue</div>
            </div>
          </div>
        </section>
      </section>
    
      <section className="sheet a4">


        <TranscriptExplanation />
      </section>
  </>
  );
};

export default Transcript;
