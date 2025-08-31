import { FaSearch, FaTimes } from "react-icons/fa";
import styles from "./LRCopy.module.scss";
import { useRef, useState } from "react";
import Invoice from "../../components/Invoice";
import { useDispatch } from "react-redux";
import { entryFailure, entryStart, entrySuccess } from "../../features/entry";
import api from "../../api/axios";
import type { EntryType } from "../../types/entry";
import { addMessage } from "../../features/message";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const LRCopy = () => {
  const [search, setSearch] = useState("");
  const [entry, setEntry] = useState<EntryType | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const handleSearchClear = () => {
    setSearch("");
    setEntry(null);
  };

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: "Invoice",
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      body {
        -webkit-print-color-adjust: exact;
      }
    `,
  });

  const handleSearch = async () => {
    if (!search) {
      return dispatch(
        addMessage({ type: "error", text: "Please enter something to search" })
      );
    }
    dispatch(entryStart());
    try {
      const response = await api.get(`/entry/?lr_no=${search}`);
      const obj = response.data;
      setEntry(obj.data[0]);
      dispatch(entrySuccess());
    } catch (error: any) {
      dispatch(
        addMessage({
          type: "error",
          text: error.response?.data?.message || "Something went wrong",
        })
      );
      dispatch(entryFailure());
    }
  };

  const handleDownloadInvoice = async () => {
    if (!Object.keys(entry || {}).length) {
      dispatch(
        addMessage({
          type: "error",
          text: "Please enter LR Number and click on search",
        })
      );
      return;
    }

    if (!invoiceRef.current) return;

    // Clone invoice DOM for off-screen rendering
    const clone = invoiceRef.current.cloneNode(true) as HTMLElement;
    clone.style.width = "420mm"; // A2 width
    clone.style.padding = "0";
    clone.style.position = "absolute";
    clone.style.left = "-9999px"; // hide offscreen
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Create A2 PDF (portrait)
    const pdf = new jsPDF("p", "mm", [594, 420]); // jsPDF allows custom page size [height, width] in mm
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      if (heightLeft > 0) {
        pdf.addPage([594, 420]); // maintain A2 size for next page
        position = -heightLeft + pdf.internal.pageSize.getHeight();
      }
    }

    pdf.save("invoice-A2.pdf");
    document.body.removeChild(clone); // cleanup
  };

  const handlePrintInvoice = () => {
    if (!invoiceRef.current) return;

    if (!Object.keys(entry || {}).length) {
      dispatch(
        addMessage({
          type: "error",
          text: "Please enter LR Number and click on search",
        })
      );
      return;
    }

    handlePrint();
  };

  return (
    <div className={styles.lrCopyContainer}>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <div className={styles.icon}>
            <FaSearch />
          </div>
          <input
            value={search}
            className={styles.input}
            type="text"
            placeholder="LR Number"
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <div className={styles.cancelSearch}>
              <FaTimes size={20} onClick={handleSearchClear} />
            </div>
          )}
          <button className={styles.searchBtn} onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      <div ref={invoiceRef}>
        <Invoice entry={entry!!} />
      </div>
      <div className={styles.controls}>
        <button className={styles.btn} onClick={handleDownloadInvoice}>
          Download Invoice
        </button>
        <button className={styles.btn} onClick={handlePrintInvoice}>
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default LRCopy;
