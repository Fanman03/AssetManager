"use client";
import React, { Component } from "react";

export default class Footer extends Component {
    render() {
        return (
            <footer className="container-fluid border-top mt-auto py-3 px-3">
                <div className="row align-items-center text-center text-md-start">
                    {/* Left side */}
                    <div className="col-12 col-md-6 d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start mb-3 mb-md-0">
                        <span className="text-muted">Asset Manager v{process.env.version} by Jack Pendleton
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="col-12 col-md-6">
                        <ul className="nav justify-content-center justify-content-md-end list-unstyled d-flex mb-0">
                            <li className="ms-3">
                                <a
                                    className="text-muted"
                                    href="https://github.com/Fanman03/AssetManager"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="bi bi-github"></i>
                                </a>
                            </li>
                            <li className="ms-3">
                                <a
                                    className="text-muted"
                                    href="https://www.patreon.com/fanman03"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <i className="bi bi-piggy-bank-fill"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        );
    }
}
